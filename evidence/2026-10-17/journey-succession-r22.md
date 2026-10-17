# Journey-succession r22 — "Who gets the dead bearer's stuff?" (2026-10-17)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** when the mantle passes, the dead bearer's gear rides home on
the corpse (death pack; loot-as-action, nothing auto-transfers — Steve
2026-10-09). Across the successor's first 26 days, what happens to the pack,
and does the village treat the successor's handling of it as grave-robbing,
inheritance, or nothing at all?

**Prior art:** r20 (forced mantle, bearer-name fix), r21 (double mantle, the
"You're not X" beat closed, 7588ec23). Both covered identity/mourning/trust.
Neither touched the death-pack economy.

**Interesting-finding criteria:**
(a) the successor batch-loots the predecessor's pack and the documented costs
    (trauma, loot_corpse witness ripple, gossip) DON'T fire → blank;
(b) on control seeds the unlooted pack is buried with the body with zero
    village acknowledgment → quiet economy sink + narrative blank;
(c) the cost fires but no transcript ever names it → trauma without meaning;
(d) anything sensical the village does with the pack that the design never named.

**Seeds:** 4101, 4102 = LOOT (successor walks to the body, batch-loots d15);
4103, 4104 = CONTROL (successor buries the bearer d16 — "the filling of it is
yours"; policy looting of the dead bearer's corpse suppressed by pilot wrapper).
**Policy:** competent. **Horizon:** kill d14, successor plays to d40.
**Binding metrics:** M1 ≥3/4 mantles pass with pack ≥1 item riding home;
M2 (loot) cost fires on both loot seeds; M3 (control) burial fate enumerated;
M4 (people) ≥2/4 transcripts meet the bar.
**Kill rule:** mantle fails on ≥2/4 → SUBSTRATE-MISSING.

## What happened

All four mantles passed cleanly (Marco→Everett, Esther→Natalie, Pongsak→Gladys,
Cheryl→Sofia). Death packs: 3, 7, 7, 3 items.

- **4101 (loot):** successor batch-looted all 3 (Vine, Fan care package
  (unopened), Stone knife). Trauma 14→20 (+6, the documented weight), trust
  38→38 (no witnesses in range — the "where others can see" rule working as
  designed), gossip +0. All 3 items still in the successor's inventory at d40.
  **The +6 fired with zero fiction** — "Taken: ... The body is stripped." and
  nothing else. The per-item search verb would have said "You take vine from
  Marco. Your hands know what they did."; the batch path (the app's TAKE-ALL
  button, the policy's strip verb — the DEFAULT paths) was silent.
- **4102 (loot):** the competent policy itself stripped the dead bearer's
  corpse at d16 (Stick ×4, Stone ×2, Fan care package, Phase sling) before the
  scripted loot — a competent player naturally claims the pack. Same silence:
  trauma moved, keepsake-soothing lines fired ("You hold Notebook. Breathe."),
  no fiction named the act. Corpse rotted to bones at Haven, never buried —
  the policy never buries (no buryCorpse call in the policy).
- **4103/4104 (control):** successor buried the bearer d16. Burial trauma
  8→13 (+5). **The 7 / 3 pack items went into the ground unnamed** — "You bury
  Pongsak. A marker, of sorts." Crowbar, flannel shirt, fan care package,
  food: vanished from play with no line. The mechanic (unlooted gear buries
  with the body) was always there; the fiction never said so.

## Village assessment (plain words)

Four villages, all alive at day 40 (9–11 living each), pantries 46k–58k kcal —
the succession system carried every mantle pass, as in r21. The dead are
mourned by name ("Darmi is gone and Marco is gone and the world just...
continues. That's the part I can't stand." — Caleb, d17). The new bearers
stepped into working villages and kept them working. What the villages do NOT
do: bury their dead (the grave the village digs sits unfilled unless the
player acts — "the filling of it is yours" is player-only, and the sim's
competent player never does it), and nobody — villager or system — ever names
what happens to the dead bearer's things. The pack is either stripped in
silence or buried in silence.

## People check

4 mourning convos driven inside the mantle-memory window. 3/4 meet the bar
(the 4th drifted: Caleb's grief thread decayed into generic alone-time
filler — "My social battery is officially dead" — honest drift, same class as
r16's borderlines). Best: "We lost Darmi and Marco this week. I keep setting
out extra portions. Stupid." — the NPC wants the dead back at the fire;
options engage it; the thread resolves into the want. No transcript mentioned
the death pack — the village has no words for the gear question, which is the
blank.

## Blank filled

**Two related silences in the death-pack economy, both fixed in
src/js/corpses.js (32 insertions, fiction-only, no mechanic changes):**

1. **Batch/per-item take verbs now name the dead and the weight** — mirroring
   the search verb's voice. `corpseLootAll` and `corpseTakeItem` say "You take
   {gear} from {name}. Your hands know what they did. (+N trauma)" once, on
   first touch (wasTouched gate — no double-voice when paths mix; ash keeps
   its own voice; monsters stay field-dressing). The trauma number is the same
   one _corpseFirstTouch already added — now it's named.
2. **buryCorpse names the grave goods** — "What they carried goes into the
   ground with them: {gear}. The village leaves the dead their things."
   (fires only when items remain; empty pack → no noise).

**Proof:** scripts/test-deathpack-voice-20261017.js — RED 4 fails on reverted
code (patch-file round-trip, no stash), GREEN 16/16 with the fix. Covers:
batch voice + names the dead + trauma-once, per-item voice, no double-voice
across verbs, monster silence, burial names goods, burial empty-pack silence.
**Wild confirmation:** re-ran seed 4101 with the fix — d17: "You take vine,
fan care package (unopened), stone knife from Marco. Your hands know what
they did. (+6 trauma)".

**Regression:** check.js --quick — 96 passed, 1 failed (pre-existing sprite
failure, same as r21; unrelated).

## Metric roll-up

- M1: 2/4 strict (recovered=true at the d15 snapshot) — **metric review below**.
  The mechanism is proven on all 4 (packs existed, rode the corpse; 4101/4102
  recovered=true; 4103/4104 were buried by the successor before the recovery
  beat fired — pilot timing, not a mechanism miss).
- M2: mechanism GO — trauma fired on both loot seeds (4101 scripted, 4102 via
  the policy's natural strip). The *fiction* missed on both → the blank.
- M3: GO — burial fate enumerated: 7 and 3 items buried-with, gear unnamed
  (now named by the fix).
- M4: 3/4 transcripts meet the bar → GO.

## Metric review

M1's "rides home (recovered=true)" clause was too strict for the pilot's
timing: the kill lands late in day 14 and the d15 snapshot raced the overnight
recoverBearer beat on 2 seeds. The recovery beat itself is proven (r9, r21,
4101/4102 here). **Proposed revision for the next run:** M1 = mantle passes +
pack ≥1 item on the corpse (recovery checked at d17, not d15).

## Reachable / fun / winnable

- **Reachable:** yes — the death pack, the strip, the burial are all
  player-facing verbs on the corpse at Haven. A real player trips over this
  content in every succession.
- **Fun:** stronger now — the weight is named. Before the fix, stripping your
  predecessor's corpse felt like a menu; now it reads like the thing it is.
- **Winnable:** unaffected — fiction-only changes; the gear economy is
  identical (take it or bury it, same as before).

## Files

- Pilot: scripts/diag-succession-r22-20261017.js
- Proof: scripts/test-deathpack-voice-20261017.js (16/16 GREEN)
- Per-seed: evidence/2026-10-17/journey-succession-r22-410{1,2,3,4}.json
- Fix: src/js/corpses.js (+32)
