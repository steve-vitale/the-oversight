# sim-wildhold — deferral-window wild-exposure restraint lever (flesh-out loop, 2026-10-19, ARM sim-wildhold)

Run: fleshout-20261019T07xxZ, arm sim-wildhold. Axis: scale-onramp (the blocking axis).
LEVER RUN — one new policy-side file (scripts/policies/wildhold.js) + a 3-line gated
stand-down read in scripts/policies/vetrel.js (inert when WILDHOLD unset), zero src/js changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; the def5 window is where this
layer lives). No canon doc covers "restraint" as a named doctrine — this layer defines
it, policy-side, from the windowsurvive taxonomy numbers.

Named next from evidence/2026-10-19/sim-windowsurvive.md: the window-death diagnostic
attributed 72 window deaths — raid 40, WILD 18 (#2 killer), alien 5, expedition 4,
other 4, disease 1. The wild channel = scholars fighting in the wild
(ctx:scholar-fight-in-wild) + villagers on the router (ctx:router — villagerMonsterTick
→ resolveWildMonsterEncounter jumps villagers sharing a tile with a world monster).
People die RICH (pantry 28,469 kcal mean at death, hungry streak 0) — the village can
afford to stay home. Both prior avenues are CLOSED: veteran-production (0-for-11) and
window-support (6 variants NO-GO — field support kills people).

## The lever — WINDOW WILD-EXPOSURE RESTRAINT (scripts/policies/wildhold.js)

RESTRAINT, not support: while the village is door-engaged (the wave-5 readiness window,
standingDeferral(5).deferred), the scholar and the far-ranging villagers stay on
home/close nodes — no far ranging into the wild. Keep people OUT of the meat-grinder
rather than sending help into it. Three honest mechanisms, all existing verbs:

1. **Scholar hold** (daily, post-base, window-gated): the scholar ends every window day
   at home/close (Chebyshev ≤ 1 from Haven). If farther out, they walk home honestly
   (Game.travelTo — real encounter rolls on the way, honest cost). Backstop, not a
   yo-yo: fires only when the base stack left the scholar far at day's end (the
   multi-day camp class — cf. the Jada d111 8-day dehydration death).
2. **Vet-hunt stand-down** (pre-daily, window-gated): the vetrel deliberate wave-3 hunts
   (every 3rd day to thicket/ruin/forest/grove — the scholar's most deliberate
   wild-combat exposure) stand down for the window via ctx._whHold, read by
   veteranHuntLeg (3-line gated edit in scripts/policies/vetrel.js, inert when
   WILDHOLD unset). The veteran channel is a CLOSED avenue; the hunts spend scholar
   lives during the window and buy nothing the window needs.
3. **Far-party recall** (daily, post-base, window-gated): villagers on far nodes
   (>2 Chebyshev from Haven) are called home. Expedition parties end honestly first
   (Game.expeditionReturn — the haul comes home, the gossip fires), then npcSetNode
   home. No shelter flag: they resume close-node duties at Haven ("home/close nodes",
   not lock-in — the food economy keeps breathing).

Env gate WILDHOLD=1 opts IN (default OFF — unset delegates byte-identically; the proof
test's RED phase + DET section pin that).

## Design calls (documented — Steve 2026-10-07 "figure it out yourself", he can overrule)

- "Close" = Chebyshev ≤ 2 from Haven (the 5×5 home block). Foragers (npcMaxDist 1)
  never trigger; wanderers/explorers and expedition parties do. The scholar is held
  tighter (≤ 1) — the scholar is the combatant of last resort and the succession chain.
- Recall, not shelter: sheltered villagers skip ALL duties for the whole window (median
  78d) — that starves the village through lost production (the shelter verb's own
  documented cost). The doctrine says the village can afford to stay home, not that it
  stops working: close-node foraging continues. The starvation guardrail judges this.
- The hunt stand-down lasts the whole window (the window usually runs to death/regress).
  The veteran leg stays short; the channel is closed anyway.
- One fiction beat at window-open ("we hold close while the door stands open"), then
  quiet — daily beats would spam the transcript for 78 days.
- Aid crises: the recall does NOT exempt them. The base stack on this substrate runs no
  deliberate aid sorties (no aidCrisis in the policy stack — the aid ctx at death is
  incidental), and the doctrine is "no far ranging", full stop.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** wild-channel deaths per run (window deaths classified 'wild' by the
windowsurvive-identical classifier), armed vs the re-swept control.
**GO:** ≥ 30% fewer wild-channel deaths on the armed arm.
**GUARDRAILS (all must hold):**
- starvation deaths ≤ control + 1 (restraint must not starve the village)
- wave-4 unlocks within ± 2/16 runs of control
- median survival no worse than −10d vs control
- no new death mode (armed cause-space introduces no cause absent on control)
**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).
**Seeds:** pilot 8 seeds (63801–63808, for comparability with the taxonomy) ×
{leadfeast, belongfeast} × {control, wildhold} = 32 runs. Confirm (only on pilot GO):
12–16 seeds.
**Policies:** competent-player policy; substrate to match the taxonomy comparability —
pre-seat + windefer, VETREL=1, SEATDRIVE=0 (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1, SEATDRIVE=0, REPOSITION
unset). Policy stack: withWildhold(withSeatDrive(withWinDefer(withVetrel(
withReposition(TF base))))) — the wildhold layer outside, armed side only.
**Balanced panel:** before/after through scripts/balance-panel.js (§15) — the panel is
the instrument, the GO threshold above is the judge. Compare .md attached.
**Base-relativity:** the control is RE-SWEPT on current master alongside the armed side,
never compared against the windowsurvive corpus numbers.

**Instrument:** scripts/probe-wildhold-20261019.js (reuse-fork of
probe-winsupport-20261019.js: identical policy stack + identical pure death-capture
reads + identical death-channel classifier — the one deliberate change: the WILDHOLD=1
arm dimension; the original is untouched), scripts/analyze-wildhold-20261019.js
(arm-shift: wild-channel deaths primary + guardrails), scripts/build-wildhold-panels.js
(§15 balanced-panel compare), scripts/wildhold-transcripts-20261019.js (SAY-line probe
for sense-testing), scripts/test-wildhold-20261019.js (proof: GATE/WINDOW/HOLD/
SCHOLAR/RECALL/BEAT fixtures + SMOKE + DET).

## Results

**PILOT: GO.** 32/32 runs complete (8 seeds 63801–63808 × {leadfeast, belongfeast} ×
{control, wildhold}, 180d death-aware, base 27834f44d47b, re-swept control). 0 bad files.

**PRIMARY — wild-channel deaths in the window: 24 → 13, 45.8% reduction — GO**
(bar ≥ 30% fewer). Per-run: control [1, 3, 8, 4, 1, 3, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0],
wildhold [2, 1, 1, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 5, 0, 0].

**Guardrails (all PASS):**
- starvation deaths: 0 vs control 0 (+1 allowed) — PASS. The villages die rich, not
  starving; close-node foraging sustains the pantry (s63801 builds to 112k kcal,
  s63806 to 75k; hungry streak 0 at end).
- wave-4 unlocks: 15/16 vs control 16/16 (delta −1, band ±2) — PASS.
- median survival: 121d vs control 124d (delta −3d, floor −10d) — PASS.
- no new death modes: none — PASS.

**Wall numbers:** national 13/16 → 14/16, table 13/16 → 11/16, wins 0/16 → 0/16,
wave-4 16/16 → 15/16, wave-5 0/16 → 0/16, median survival 124d → 121d.
Window deaths: 81 → 61 (scholar 49→38, villager 32→23). Door-reaching 10/16 both arms;
died in window 10 → 7 (2 horizon holds on armed).

**Lever fidelity (armed arm):** 10/16 runs engaged the layer — 481 hold-days, 2 scholar
recalls, 95 villager recalls, 231 vet hunts stood down, 10 window beats. The hunt
stand-down is the workhorse (231); the scholar hold backstop rarely fires (2) — the
base bot returns the scholar daily on its own; the value is in killing the multi-day
camps. Villager recalls (95) chop far-time into 1-day segments.

**Balanced panel (§15):** scripts/build-wildhold-panels.js → evidence/2026-10-19/
wildhold-panel-primary.{json,md} (+ .json.gz pair). Decision: review_required — the
panel flags table regression_watch on leadfeast (delta −0.25, ci [−0.75, 0.25]).
The panel is the instrument; the pre-registered threshold (wild deaths −30%) is the
judge — but the table signal (13→11, all on leadfeast 6→4) is real enough to watch in
the confirm.

**Iteration note (honest):** the FIRST pilot sweep hit the primary (58.3%) but breached
noNewDeathModes — a single 'thirst' death on armed (Henry, s63807 leadfeast d101, died
of thirst AT HAVEN during a raid with the cistern dry). Root cause found in code:
water trips range 1–3 tiles (2–4 when the cistern is low — DESIGNCALL 7), and the
recall was interrupting the water crew at >2, running the cistern dry. Fix: water-
purpose trips are exempt from the recall (scripts/policies/wildhold.js). The re-run
above is WITH the fix — no thirst deaths, guardrail PASS. The 58.3% number is
superseded; 45.8% is the honest pilot result.

## Metric review

1. **The 'thirst' guardrail breach was a real design flaw, not noise.** The recall
   interrupted water supply (mechanism verified in villager-objectives.js). Fixed by
   exempting water-purpose trips. The fix is minimal and targeted.
2. **Table regression_watch (panel):** 13→11 is within binomial noise at n=16 but
   concentrated on leadfeast. Not a pre-registered guardrail for this arm; watching
   in the confirm. If it persists, it's a real cost to name.
3. **Primary metric is wild-channel deaths, but total window deaths also fell 81→61.**
   The restraint saves lives beyond the wild channel (raid deaths 46→35 — fewer
   scholars caught out during raids). The primary understates the effect; the
   pre-registration binds, but the confirm will report both.
4. **Per-run wild deaths are zero-heavy** (many runs have 0 wild deaths on both arms).
   The 45.8% is driven by the high-exposure runs. This is fine for a pilot but the
   confirm should check the reduction holds across seeds.

## Village assessment

What the villages looked like: 16 villages on the pre-seat full win-side stack with
the wildhold restraint. They are villages that HOLD — the window-open beat fires
("The door stands open and the wild is hungry. No far ranging while it lasts — the
parties stay close, the scholar stays home. We hold what we have."), the far parties
are called home daily, the vet hunts stand down. The pantry stays full (close-node
foraging sustains it). They reach national 14/16 and the table 11/16, unlock wave-4
15/16 — the scale wall's outer markers hold — but wins 0/16, wave-5 0/16. The
restraint keeps them alive through the window better (died in window 10→7), but it
doesn't open the wave-5 door.

Who thrived and who died and why: the scholar still dies more than the village
(38 vs 23), but both less than control (49 vs 32). The wild deaths that remain are
the stubborn ones: water-haulers on exempt trips (Oscar d70 — "The well won't fill
itself"), far-rangers who chafe (Hildegard d91 — "Walked the far treeline"),
scholars who insist on ranging (Xiaoming d108 — "out past the ridge... would've gone
farther if we'd let them"). The restraint is a backstop, not a leash — bold people
still go out, and sometimes die. That's people acting like people.

What the village does while holding: it functions. The transcripts show the same
living community — teaching, gossip, monster-naming arguments — with the addition of
the hold beat. The pantry stays rich. Nobody starves.

## Sense-testing (SENSE-TESTING LAW)

Read: 2 armed transcripts — wildhold/leadfeast s63801 (3,822 SAY lines, d54–98),
s63806 (2,917 SAY lines, d87–114).

**The beat reads as sensible caution, not cowering.** "The door stands open and the
wild is hungry. No far ranging while it lasts — the parties stay close, the scholar
stays home. We hold what we have." It fires once per window, then quiet. It names
the threat and the policy plainly.

**The fiction-mechanics gap:** the beat says "no far ranging," but expeditions still
launch during the window (Gastón "back from the north" d72, after the d57 beat).
The recall is post-hoc — it calls them home, but they go out again. The beat
over-promises; the mechanism under-delivers on the promise but still cuts far-time.
This is honest restraint (a backstop), not a lock-in, and the numbers show it works
(45.8%). But the beat should probably say "we call them home" not "no far ranging."

**Chafing is GOOD fiction.** Hildegard (d89: "Walked the far treeline... the good
stuff keeps to the damp hollows") and Xiaoming (d87: "out past the ridge... would've
gone farther if we'd let them") keep ranging despite the hold. They die (d91, d108).
This is people acting like people — the restraint doesn't make them cower, and the
deaths read as their choices, not the policy's failure.

**Water trips are the honest exception.** Oscar (d57–d70): "heads out for water...
The well won't fill itself," stares down the Big Big, returns with +3 clean, goes out
again, dies d70 wild/monster. The water exemption works as designed — but it means
the water crew remains exposed. That's the tradeoff, and it reads as meaningful
sacrifice, not a bug.

**Close-node foraging sustains the pantry.** s63801: 27k→112k→0 (died rich);
s63806: 30k→75k→27k. Hungry streak 0 at end. The starvation guardrail (0 vs 0) holds
in the fiction too — nobody goes hungry.

**Blanks:** the beat gets no verbal reaction (nobody argues for/against the hold in
dialogue — the chafing is behavioral only). The recall itself is silent (no "called
home" beat — by design, to avoid spam, but it makes the mechanism invisible).

## Named nexts

1. **Confirm (pre-registered):** 12–16 seeds. Running: 4 more seeds (63809–63812) ×
   {leadfeast, belongfeast} × {control, wildhold} = 16 runs. Watch the table signal.
2. **Beat wording:** "no far ranging" over-promises; consider "we call the far parties
   home" to match the backstop mechanism.
3. **Table regression:** if the confirm shows the table drop persisting, investigate
   whether the restraint blocks table content (or if it's noise).

## Out-of-arm findings

(Appended to hidden_files/sim-findings.md, not chased.)
- CONFIRM GO: wild-channel deaths 29→18 (37.9% reduction, ≥30% bar); guardrails PASS (national 20 vs 18, table 17 vs 18 [band ≥16], wave-4 22 vs 22, median 103 vs 104d).

## Convergence

**converging.** The pilot is GO (45.8% wild reduction, all guardrails pass), but wins
0/16 and wave-5 0/16 — the axis stays converging. The restraint is a real lever
(it saves ~20 window deaths/run-set), but it doesn't open the door.

## Files

- scripts/policies/wildhold.js — the lever (this run; water exemption added after pilot v1)
- scripts/policies/vetrel.js — 3-line gated _whHold stand-down read in veteranHuntLeg (inert when WILDHOLD unset)
- scripts/test-wildhold-20261019.js — proof: GATE/WINDOW/HOLD/SCHOLAR/RECALL/BEAT fixtures (35/35) + SMOKE + DET
- scripts/probe-wildhold-20261019.js — reuse-fork sweep (this run)
- scripts/analyze-wildhold-20261019.js — arm-shift comparison (this run)
- scripts/build-wildhold-panels.js — §15 balanced-panel compare builder (this run)
- scripts/wildhold-transcripts-20261019.js — SAY-line probe (this run)
- evidence/2026-10-19/perseed-wildhold/{control,wildhold}/{leadfeast,belongfeast}/s63801–s63808.json — 32 per-seed pilot JSONs (this run)
- evidence/2026-10-19/perseed-wildhold/{control,wildhold}/{leadfeast,belongfeast}/s63809–s63812.json — 16 per-seed confirm JSONs (complete, 29→18 GO)
- evidence/2026-10-19/wildhold-corpus-summary.json — corpus + arm-shift comparison (this run)
- evidence/2026-10-19/wildhold-arm-shift.md — arm-shift tables (this run)
- evidence/2026-10-19/wildhold-panel-primary.{json,md} (+ .json.gz pair) — §15 panel compare (this run)
- evidence/2026-10-19/wildhold-transcripts/wildhold-leadfeast-s63801.txt — 3,822 SAY lines (this run)
- evidence/2026-10-19/wildhold-transcripts/wildhold-leadfeast-s63806.txt — 2,917 SAY lines (this run)
- evidence/2026-10-19/sim-wildhold.md — this file
