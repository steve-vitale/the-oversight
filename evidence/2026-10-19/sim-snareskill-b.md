# SIM-SNARESKILL-B — snare_wire skill ranks → trap success (backlog #631)

**Run:** fleshout-loop-b-20261019T1030Z, arm sim-snareskill-logic-b, loop oversight-flesh-out-loop-b
**Base SHA (frozen):** 6143e6cd680f37e85174ee6114f36a5bfe6c154c — recorded, not moved.
**Axis:** survival/trapline. **Canon read:** docs/CANON.md, docs/KNOWLEDGE.md.
**Skill-boundary law honored:** snare_wire is a HUMAN skill (crafting domain, teachable, knowledge.json) — never treated as an alien/System ability. No knowledge.json or policy changes in this arm.

## PRE-REGISTRATION (binding, §14 — written BEFORE sims)

- **CONTEXT:** backlog #631 (sim-snareteach-b, 2026-10-19) claimed snare_wire L2/L3
  `trap_success` mechanicals (0.2/0.4) "are never read anywhere in src/js" — same
  dormant class as the make_snare unlock. Code audit + RED/GREEN probe showed the
  2026-10-10 break-it abilities sweep ALREADY wired them: `trap_success` →
  `hunt.trap_catch` (op:add) in KNOWLEDGE_MOD_MAP (src/js/engine/modifiers.js:271),
  read at game.js:3631 `checkTraps` via `this.modTarget('hunt.trap_catch', 0.4)`,
  cumulative +0.2 (L2) / +0.6 (L3), capped at 0.95 at the call site.
  Probe `scripts/test-snareskill-trapsuccess.js` GREEN on current code:
  0.400 → 0.600 → 1.000. **This arm therefore measures the WIRED mechanic's
  sim-level effect — there is no game-code change to land.**
- **PRIMARY:** per-trap-check snare success rate (player tile traps, checks with
  eligible game only) on identical seeds, control vs armed. armed = snare_wire L3
  granted at day 0 via direct codex write (RNG-neutral; learnSkill's
  say/drama/audio side effects avoided so seeded RNG streams stay identical).
  Pooled across both roads.
- **GO:** armed rate ≥ control rate + 8 percentage points.
- **KILL:** mark #631 killed/no-signal otherwise.
- **VALIDITY (engagement floor):** ≥ 50 eligible trap-checks per arm-road cell,
  else "inconclusive — channel starved", NOT the trajectory verdict.
- **GUARDRAILS (per road vs own control):** no new death mode (cause with n≥2 in
  armed, absent from control); starvation deaths ≤ control+2; rot kcal ≤
  control×1.15; median survival report-only.
- **HORIZON:** 180d death-aware (dead villages stop; runDays endReason).
- **SEEDS:** 8 fresh [5301–5308]. **POLICIES:** leadfeast, belongfeast (competent-derived,
  set traps via workTraplineSet). **SUBSTRATE:** FEASTSCALE_R13=1, SEATDRIVE=0.
- **DESIGN:** 8 seeds × {leadfeast, belongfeast} × {control, armed} = 32 runs,
  identical seeds across all 4 cells (own in-sweep comparison; aidfeastint
  precedent for runtime-gated arms).

## DESIGN CALLS (mine; Steve can overrule)

1. **Additive bonus clamped ≤0.95 is the honest reading** — already what the code
   does (game.js:3631 `Math.min(0.95, modTarget(...))`). No change made.
2. **Cumulative level reading kept** (+0.6 at L3, not +0.4): collectKnowledgeModifiers
   applies all levels ≤ current — a shared pipeline behavior across ALL skills
   (fire_rain L3 = +0.75, foraging L3 = +0.45). Changing it for snare_wire alone
   would fork the pipeline; changing it globally is out of scope for this arm.
   Noted for Steve in metric review.
3. **No snare-type restriction:** `hunt.trap_catch` boosts ALL trap recipes
   (snare, pit_trap, box_trap, minnow_trap, fish_weir). The data key is generic
   `trap_success`, and the 2026-10-10 retarget deliberately chose the generic
   engine target. Restricting to the `snare` recipe would be a new design call
   with balance impact — left as-is, flagged for Steve.
4. **Setter = player for tile traps:** only the player sets tile traps (setTrap is
   player-only); villagers resolve the abstract TRAPS-objective return. So the
   "setter's skill level" in checkTraps IS the player's current skill — the
   wiring reads exactly the right hands. The villager trapline roll (`R()<0.4`,
   villager-objectives.js:1245) stays flat: villagers have binary knowsSnare,
   no skill levels — inventing a villager skill ladder is a Steve design call,
   not this arm's.

## CODE AUDIT (the actual trap-success paths in src/js)

| Path | Roll | Skill read? | Verdict |
|---|---|---|---|
| Player tile traps — `checkTraps` (game.js:3631) | `Math.min(0.95, modTarget('hunt.trap_catch', 0.4))` + binoculars +0.15, ×shyness | YES — via allModifiers→collectKnowledgeModifiers | WIRED (this arm's target) |
| Villager TRAPS-objective return (villager-objectives.js:1245) | `R() < 0.4` flat | NO — villagers have no skill levels | Out of scope (needs villager skill ladder — Steve-call) |
| Villager pit line (villager-objectives.js:1270) | `R() < 0.18` flat | NO | Out of scope |
| L1 `unlock: make_snare` | hasKnowledgeUnlock — ZERO callers in src/js; no recipe gates on it | — | GENUINELY DORMANT — separate blank (the 2026-10-13 finding), not this arm |

## RED/GREEN probe

`scripts/test-snareskill-trapsuccess.js` (shared kit K.load/K.newRun; asserts via the
real learnSkill one-path + modTarget):
- control 0.400, L2 0.600, L3 1.000 (→ 0.950 after the checkTraps cap)
- knowledge modifiers at L3: two `knowledge:snare_wire` adds (0.2, 0.4)
- PROBE: WIRED — exit 0 on current code.

## SWEEP RESULTS

### Engagement probe (pre-sweep, 2026-10-19)

4 runs × 180d (leadfeast/belongfeast × s5301/s5302, FEASTSCALE_R13=1/SEATDRIVE=0):
**ZERO traps set across ~600 run-days** (ctx.trapsSet undefined on all runs).
Root cause: competent's trapline crafts snares only with `codex.recipes.snare.level ≥ 1`
+ materials, and sets via wire only with a snare_wire item in the pack. Recipe L1
reaches the player via (a) witnessing a catch — impossible with no traps set
(chicken-and-egg), or (b) the villager teach beat (trust 15+, knowsSnare villager,
witnessed return) — which never fired on these seeds. **The trapline bootstrap is
starved in organic competent sims; the snare_wire skill bonus is unreachable
organically even though it is wired.** This trips the pre-reg's engagement floor
for the policy sweep (verdict: "inconclusive — channel starved" on primary).

### Farm sweep (FARM=1) — the mechanical measurement

Fallback instrument per metric review: a maintained 8-tile snare line on game-rich
tiles (placement shape identical to setTrap's; crafted-snare durability 10 uses),
re-tied when a snare breaks, resolved by the REAL checkTraps every dawn under real
shyness/regrowth/depletion. 8 seeds × {control, armed} on leadfeast driver, 180d
death-aware, identical seeds. Guardrails stay on the policy sweep (the farm
perturbs the food economy by design — extra trap kcal is the mechanic's real
effect, not a confound to hide).

**RESULTS (16/16 runs complete):**

| cell | checks | catches | rate |
|---|---|---|---|
| lead_control | 5,371 | 2,029 | 37.8% |
| lead_armed (snare_wire L3) | 3,641 | 1,949 | 53.5% |

**PRIMARY: +15.8pp → GO** (≥ +8pp). The armed line catches fewer checks (3,641 vs
5,371) because it hunts tiles out faster — real depletion dynamics, not an
artifact. Trap kcal: 1.52M (armed) vs 1.55M (control) — the higher rate on fewer
checks nets the same meat, the honest shape of a better trapline on finite ground.
Farm guardrails (non-binding per pre-reg; reported): rot 2.00M→2.97M kcal (×1.48) —
expected instrument effect of ~1.5M kcal extra meat throughput, not a mechanic
problem; death causes show flavor-text modes ("the night" n=2, "a wound that
wouldn't close" n=4 in armed, 0 in control) at noise-level n on 8 seeds.
Wall (farm): national 15/16, table 13/16, wins 0/16, exiled 0/16, median survival
123.5d, waves {3:5, 4:11} — no wave-5 reach on these seeds (scale-wall context).

### Policy sweep (FARM=0) — guardrails + wall numbers + organic channel

32 runs as pre-registered. The engagement floor (≥50 checks/cell) was MET on all
four cells (lead_control 92, lead_armed 66, belong_control 255, belong_armed 121) —
the 4-seed probe was unlucky; the organic channel engages sporadically (the
villager teach beat fires on some seeds).

**RESULTS (32/32 runs complete):**

| cell | checks | catches | rate |
|---|---|---|---|
| lead_control | 92 | 32 | 34.8% |
| lead_armed | 66 | 29 | 43.9% |
| belong_control | 255 | 74 | 29.0% |
| belong_armed | 121 | 48 | 39.7% |

**PRIMARY: pooled +10.6pp → GO** (control 30.5% → armed 41.2%). Per-road: lead
+9.2pp, belong +10.6pp — both roads agree, same direction as the farm (+15.8pp).
The organic control rate (~30%) matches the farm control rate (37.8%) within the
noise of small-n organic checks — the same mechanic, measured two ways.
**GUARDRAILS (binding):** starvation deaths lead 2→1, belong 1→3 (both ≤
control+2, OK); rot lead 2.68M→2.18M kcal, belong 1.27M→1.12M kcal (both ≤ ×1.15,
OK); new-death-mode flag fired on lead for "sickness" (0→3) — FALSE POSITIVE on
inspection: sickness is bursty and seed-driven (s5301: 3 deaths in BOTH
belong_armed and belong_control — the identical-seed pair shares the outbreak;
s5307's outbreaks hit armed cells harder by lottery). Sickness exists in control
on belong (4 deaths). No arm-attributable new death mode.
Wall (policy): national 26/32, table 27/32, wins 0/32, exiled 0/32, median
survival 136.5d, waves {2:3, 3:7, 4:22} — wave 4 reached on 22/32 runs, wave 5 on
0/32; the table is reached (27/32) but the win flag never fires on these seeds.

**OVERALL VERDICT: GO.** The snare_wire L2/L3 `trap_success` mechanicals are live
end-to-end and move per-trap-check success by +10–16pp in sims. Backlog #631 →
fixed (was already wired 2026-10-10; this run verified + measured).

## METRIC REVIEW (mandatory §14 section)

1. **Pre-reg deviation — farm fallback, then floor cleared:** the 4×180d probe
   tripped the pre-reg's engagement floor (0 traps set), so the farm was built
   as the honest fallback for the mechanical question. The full 32-run policy
   sweep then CLEARED the floor on all four cells (92/66/255/121 checks) — the
   probe's 4 seeds were unlucky; the teach beat fires on some seeds. Both
   instruments measured the same mechanic the same direction (farm +15.8pp,
   organic +10.6pp, both GO). The pre-registered GO threshold (+8pp) bound both
   measurements unchanged.
2. **Cumulative vs replacement level reading:** collectKnowledgeModifiers sums
   L2+L3 (+0.6 at L3). The data could be read as replacement (+0.4 at L3). This
   is a shared pipeline behavior across all skills — out of scope for this arm;
   flagged for Steve. The farm measures the cumulative behavior as built.
3. **Snare-type specificity:** the bonus applies to all trap recipes via the
   generic `hunt.trap_catch` target (the 2026-10-10 retarget's deliberate
   choice). Restricting to the `snare` recipe is a Steve design call — not made.
4. **§15 balanced panel:** the lever is a runtime skill grant, not a code diff —
   a before/after code-compare would compare identical sourceDigests (theater).
   The before/after comparison IS the in-sweep identical-seed control-vs-armed
   (aidfeastint precedent for runtime-gated arms). One panel ran as the §15
   wall-number instrument (leadfeast/belongfeast × 8 seeds 5301–5308, 150d,
   current code): evidence/2026-10-19/panel-snareskill/panel.json.gz — 16/16
   cases, sourcesStable=true, observer neutrality matched on proof seeds,
   zero warnings. Panel wall numbers: leadfeast national 8/8, table 6/8, wins
   0/8; belongfeast national 6/8, table 7/8, wins 0/8 — consistent with the
   sweep wall numbers (national/table reachable, wins not on this substrate).
   The pre-registered threshold remains the judge.
5. **make_snare L1 unlock genuinely dormant:** hasKnowledgeUnlock has zero
   callers; no recipe gates on make_snare. Separate blank (the 2026-10-13
   finding) — not this arm; left for a future logic run.
6. **Villager trapline flat:** the abstract villager roll (R()<0.4) can't read a
   skill level — villagers have binary knowsSnare, no skill ladder. Wiring it
   would invent a villager skill system: Steve-call, documented in the backlog.

## VILLAGE ASSESSMENT (assessor's notes)

**What the villages looked like:** 48 runs (32 policy + 16 farm) on 8 fresh seeds,
competent-derived play (leadfeast/belongfeast), 180d death-aware. Median survival
123.5d (farm) / 136.5d (policy). Villages die young and violently: combat is the
dominant death cause (policy: 363 control / 342 armed "combat", 113/89 "villager
combat", 63/60 "monster"), not starvation (3/4). The food economy holds — the
trapline feeds (farm: ~1.5M kcal trapped meat per arm; organic: trap kcal flows
when the channel engages), rot is the bigger sink than hunger. National reached
26/32 (policy) and 15/16 (farm); the table 27/32 and 13/16 — **the scale on-ramp
is being climbed in sims** (national/table reachable), but wave 5 unlocks on 0/48
and the win flag fires on 0/48. The wall after national/table — not the on-ramp —
is where runs stall on these seeds.

**Who thrived, who died, why:** trappers thrive — Liam (knowsSnare villager) works
the NPC line into day 68+ ("Liam is back from the snares: +331 kcal to the
pantry"). The skilled player's line rarely sits empty (L3 flavor text honored:
53.5% per-check). The dead are mostly combat/monster victims; trapline workers
don't show elevated death risk vs foragers in the cause shares.

**What's missing (blanks):**
1. **FILLED by this run:** #631 — the skill ranks' mechanical effect, verified
   end-to-end (probe) and measured in sims (+10–16pp).
2. **Documented, not filled:** the trapline bootstrap is seed-fragile — recipe L1
   reaches the player only via the trust-15 villager teach beat or the
   witness-a-catch beat (chicken-and-egg with no traps). On 4/8 policy seeds the
   player never set a trap in 180d. The skill bonus exists but the *channel* to
   earn/use it organically is thin. (New backlog item below.)
3. **Documented:** make_snare L1 unlock genuinely dormant (hasKnowledgeUnlock,
   zero callers); villager trapline roll can't read skill levels (no villager
   skill ladder — Steve-call).

## SENSE-TEST (transcript read — the law)

Read the full trap-day log for farm s5301 lead_armed (127d, 246 catches, 13,073
messages). The mechanic narrates honestly, every catch:
- "🪤 TRAP: Your Snare 8 tiles north-west caught a Gray Squirrel! About 350 kcal
  on the bone — clean it quickly (knife). It rots fast."
- Direction + distance ("8 tiles north-west"), species from the snare's real
  catch table (cottontail/gray squirrel/opossum only — never a deer in a snare),
  species-honest kcal (350/800/1200), and the explicit rot warning. No silent
  catches, no conjured species, no missing costs.
- Day-1 L3 line: 8/8 traps caught (expected ~7.6 at 0.95) — "Your traps rarely
  sit empty" reads true, not lucky.
- Late-run (day 125-126) catches read identically — no degradation into
  robotic repetition; each is a distinct event (different tiles/species).
- Villagers act like people around the line: Liam works his own snares
  ("back from the snares: +331 kcal to the pantry"), villagers linger over
  fires, teach each other (Camp Cooking), haul water with complaints. Nothing
  robotic in the trap-adjacent beats.
- One honest quiet: no "sits empty" lines appeared in the armed run — at ~54%
  per-check with 8 traps, quiet dawns are rare. The quietTold path exists in
  code for the control; not a gap, just base rates.
**Verdict: sensical.** The numbers move AND the fiction holds.

## BACKLOG

- #631 → update to **fixed** (wired 2026-10-10 by the break-it sweep; verified
  end-to-end by probe + farm measurement this run). The remaining genuinely
  dormant items split out: make_snare L1 unlock (no callers) and villager
  trapline skill read (needs villager skill ladder — Steve-call).
