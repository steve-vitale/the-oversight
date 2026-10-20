# SIM-DUTYFISH-B — duty_fish scale-up pilot (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-dutyfish-b
Axis: food-economy (scale-wall lens) — the DIAG's second candidate from the
sim-prodrebound-b DIAG-GO (evidence/2026-10-20/sim-prodrebound-b.md, f3b91aa85),
claimed from findings backlog #691 (sim-sharelean-b KILLED-AT-PILOT, the
share_surplus lean valve).
Base SHA: (worktree tip at proof time — filled in on landing).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — binding, written BEFORE any sims)

- **Question**: duty_fish is the ONE lean-responsive inflow channel (DIAG:
  lean 371 vs fat 12 kcal/day = 31.46x, fires 42.3% of lean days, ~879
  kcal/day when firing, driven by the PRODTHROTTLE disengage leg). The
  sharelean kill proved the lean collapse is a PRODUCTION blank, not a
  sharing blank (crisis sharing already opens the gate; no hidden hoard).
  Does widening fish-duty staffing on lean days — more villagers on the nets
  when the engine already lets them fire — raise lean-day PRODUCTION and
  per-villager capture?
- **Lever**: DUTYFISH_B widening (policy-side, scripts/policies/dutyfish-b.js,
  ZERO src/js). Wraps feastscale's leadfeast/belongfeast (leaddutyfish /
  belongdutyfish). DUTYFISH_B=1 default OFF (unset → pure delegation,
  byte-identical — pinned by the proof's RED phase). Requires FEASTSCALE_R13=1
  (loud DUTYFISH STOP otherwise — can never silently run on the wrong
  substrate). Mechanic: at the START of policy.daily (before the base
  policy's evening routine — the base policy donates the scholar's haul into
  the pantry, so a post-base reading is the fed posture, not the lean one),
  if Game.pantryFreshDays() <= 4 (the PRODTHROTTLE threshold —
  prodThrottleEngaged() is literally `pantryFreshDays() > 4`), top up 'fish'
  assignments to 5 total from FREE villagers only (never re-tasks
  hunt/patrol/cook/water/wood/garden/… — the widening is ADDITIVE labor;
  defense, cooking, and the throttle's own alt-work keep their people),
  occupation-preferred (fisherman/fishing guide/sailor/hunter/cook/forager),
  deterministic roster order. One deduped say line per lean day when ≥1
  fisher was actually staffed. The throttle stacks BY CONSTRUCTION: the
  lean gate IS the disengage leg's own threshold, so widened duties fire
  through as fish when dawn stays lean; if the evening donation pushes dawn
  above 4, the throttle honestly redirects them to alt-tasks (measured, not
  fought). No water-access cap coded — the engine's fished-out creek honesty
  is the cap; overfishing is measured, not fought.
- **Method**: paired before/after on identical seeds, pooled over lead+belong.
  Control: DUTYFISH_B unset. Armed: DUTYFISH_B=1. Both sides leaddutyfish /
  belongdutyfish + FEASTSCALE_R13=1 + SEATDRIVE=0 + SURPLUSFEED unset.
- **PRIMARY (binding)**: lean-day duty_fish-channel inflow ratio
  (armed/control on identical seeds, pooled lead+belong) >= 1.3x. Lean-day
  inflow = Σ per-day pantry inflow on days whose DAWN pantryFreshDays ≤ 4
  (the DIAG's lean definition), channel duty_fish per the DIAG instruments.
  The sharelean bar was 1.3x and the valve missed at 1.05x — this lever's own
  channel should scale with more fishers, so 1.3x is the honest deliberate
  bar (reachable only if the widening actually lands fish).
- **CO-PRIMARY (binding)**: per-villager capture = lean-day total pantry
  inflow / Σ lean-day roster, armed/control >= 1.0x (the #691 metric
  proposal — separates the compositional roster effect from the funnel
  effect; the widening must ADD production, not dilute it across a
  collapsing roster).
- **GUARDRAILS (hard)**: starvation deaths <= control; median survival >=
  control−10d; national >= control−2; fast-rot pooled/100d <= 1.15x control
  (more fish must not rot — the DIAG measured duty_fish product as eaten,
  4.3% rot); laundering 0 (the arm moves no food between funnels — it only
  assigns work; measured anyway); no new death MECHANISM.
- **Horizon**: 180d death-aware (dead villages stop +10d tail max).
- **Seeds**: 5601–5608 × leaddutyfish/belongdutyfish = 16 configs. Fresh:
  not on the coordinator's banned list (sharelean's list + 5201–5208 +
  8001–8008) and unused by any prior run as seeds (all "5401"/"5601"
  matches in old evidence are kcal-amount or round-count false positives —
  "5401-round stall", pantryKcal 5602 — verified 2026-10-20; 9401–9408 and
  9601–9604 are contaminated by journey-deepening runs). The sweep asserts
  the banned list inline and STOPS on any hit.
- **Det-gate**: 16/16 bit-identical repeat-pairs on BOTH sides (control×2,
  armed×2 per config) before trusting any number (r27 rule). Gate-off
  byte-identical pinned in the proof.
- **Panel (§15)**: attempt the balanced panel via scripts/balance-panel.js;
  NOTE the documented env-flag caveat (pantryguard-b2/inflowguard-b/
  sharelean-b evidence): if an env-flag treatment cannot produce a valid
  panel compare, document it honestly and do NOT ship a bogus panel — the
  pre-registered metrics bind regardless.
- **Verdict form**: GO (pilot meets PRIMARY + CO-PRIMARY + guardrails →
  confirm 12–16 seeds) / NO-GO (kill fast at pilot — layer deleted zero-trace
  per kill protocol, instruments + evidence kept).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. No fishing canon doc
  exists — the lever plays with ASSIGNMENT breadth (a policy act), not the
  fishing mechanic (species-honest yields, ecology, regrowth), so no canon is
  invented. The food ladder is untouched; the lever assigns work, never
  converts, cooks, or re-clocks food.
- The lean threshold (≤ 4 fresh-days) IS the PRODTHROTTLE threshold by
  construction. The arm is one funnel's lean answer, not a second throttle:
  it staffs the disengage leg's own channel wider, stacked on the engine's
  decision, never overriding it.
- No-silent-actions: the widening voices one line per lean day when it
  actually staffed ≥1 fisher, deduped.

## Design calls (Steve: "figure it out yourself" — numbered, overrulable)

- **D1**: WANT_FISHERS=5 (base competent staffs max 3 at pantryKcal<15000 —
  "Two fishers from day one… Two is the sweet spot… Three when the pantry
  is critical"). The widening is additive: free villagers only, never
  re-tasks — a re-tasked patroller or cook would trade defense/cooking for
  fish, and the guardrails must judge the widening, not a reshuffle.
- **D2**: Lean evaluated at the START of policy.daily, before the base
  policy's evening routine (proof debugging 2026-10-20: the base policy
  donates the scholar's haul into the pantry during daily, so a post-base
  reading is the fed posture — the first build silently never fired).
  The leader's call is made on the thin pantry they actually see; the
  assignments resolve during the next day's parts.
- **D3**: DUTYFISH_B=1 without FEASTSCALE_R13=1 throws a loud DUTYFISH STOP —
  the arm can never silently run on the wrong substrate (sharelean D2).
- **D4**: Occupation preference (fisherman/fishing guide/sailor/hunter/cook/
  forager), deterministic roster order, no policy RNG — the policy never
  touches global.__policyRandom; the game RNG is drawn only by the engine's
  own assignTask/obedience path, deterministic per seed.
- **D5**: The throttle stack is asserted, not assumed: ctx._dfThrottleHit
  counts staffed days where prodThrottleEngaged() was true (must be 0 —
  proven in the proof's G3).
- **D6**: No water-access cap coded. The engine's fished-out-creek line
  ("Nothing to catch. It'll come back if it rests.") is the honest cap;
  the sweep measures whether 5 fishers strip the creek (dayInflow
  duty_fish flatlining late-run would show it).
- **D7**: assignTask's refusal return is truthy ({ok:false, refused:true}) —
  the layer counts ONLY r.ok as staffed (caught in proof review; the naive
  `if (r)` would have counted refusals).
- **D8**: Seeds 5601–5608 (fresh per the banned/used check above). Paired
  control re-measured on the current tip in the same sweep.

[RESULTS PENDING — proof + det-gate + pilot sweep at time of pre-registration write]

## Proof results

scripts/test-dutyfish-b.js — 15/15 checks passed (FEASTSCALE_R13=1, base
8de1b508b), run BEFORE any pilot sims:

RED (gate-off byte-identical, DUTYFISH_B unset):
- R-off: belongdutyfish≡belongfeast and leaddutyfish≡leadfeast on seeds
  5601/5602, 40d — trajectory rows + say-stream + death counts bit-identical
  (4/4).
- R-stop: DUTYFISH_B=1 without FEASTSCALE_R13=1 throws loud DUTYFISH STOP.

GREEN (DUTYFISH_B=1):
- G0: layerOn() true.
- G1a: 200k-stocked pantry (fat) → 3/3 daily evals not lean, 0 staffed.
- G1b: drained pantry (→ ~2 fresh-days) reads lean and the widening fires.
- G2a: widenFish staffs from free villagers only — never re-tasks existing
  hunt/patrol assignments (unit fixture, 8-villager hand-set roster).
- G2b: widens toward WANT_FISHERS=5 (5 staffed from 6 free; 2 preserved
  assignments untouched).
- G2c: no-op when 5+ already fishing.
- G3: widened lean-day duties actually RESOLVE as fish (resolveOneAssignment
  task counts on a drained 12d run) — the arm stacks on the engine's
  disengage leg, never fights it.
- G4: armed run deterministic (25d repeat bit-identical).
- G5: voice deduped to one line/day, only on staffed days.
- SMOKE/G6: armed staffs strictly more ok fish-duty assignments than control
  on identical drained seeds.

SENSE: the widening's voice reads honest and human: "🎣 The pantry is thin
(~2 days of fresh left). The creek crew doubles up — 5 more hands to the
nets. What the water gives, the village keeps."

FIXTURE HONESTY NOTES (caught by the proof, documented for the record):
- The first build evaluated lean AFTER base.daily — the base policy donates
  the scholar's haul during daily, so the post-base reading was the fed
  posture and the lever silently never fired (14/15 with a vacuous G5/G6).
  Fixed: lean is read at the START of policy.daily (dutyfish-b D2) — the
  leader's call is made on the thin pantry they actually see.
- The first G1b/G6 used a TOTAL pantry drain — the engine scatters the
  village after 3 hungry days, so the run died before the first widened fish
  duty resolved. Fixed: drainToFreshDays(2) — lean (≤ 4) but survivable.
- assignTask's refusal return is truthy ({ok:false, refused:true}) — the
  layer counts ONLY r.ok as staffed (dutyfish-b D7).
- The voice line first read the post-donation posture ("~6 days of fresh
  left" on a thin call) — now reports the decision-time reading.

## Det-gate

scripts/detgate-dutyfish-b.js — 16/16 bit-identical repeat-pairs on BOTH
sides (seeds 5601–5608 × leaddutyfish/belongdutyfish × {control, armed} × 2
reps, 180d death-aware, no instruments). Per-day [pantryKcal, roster,
deaths] + say-stream hashed; control vs armed are NOT expected to match
(the lever staffs extra fishers on lean days).

INFRA NOTE (2026-10-20): a mid-run service restart killed the first det-gate
attempt at ~25 min with no output saved (all work scripts live in the
worktree — nothing lost; /tmp debug files wiped as documented). The det-gate
now journals completed pairs to ~/workspace/detgate-dutyfish-b-progress.jsonl
and resumes. Separate finding: sims run ~1s/day on current master vs the
sharelean det-gate's 126s/64-runs — root cause is BOX LOAD (load avg 17 on
2 CPUs; sibling loop-A sweeps sweep-scholarsurvive/sweep-retagrot-b/
sweep-villagergear running concurrently), not a substrate regression —
verified identical slowness on the main tree (1e97b471c) with the base
leadfeast policy. The det-gate runs 2-way parallel (seed halves) with
resume.

[RESULT PENDING — chunks running at time of writing]

## Pilot results

[PENDING]

## Balanced panel (§15)

[PENDING]

## Metric review (§14)

[PENDING]

## Village assessment (plain words)

[PENDING]

## Sense-testing

scripts/sense-dutyfish-b.js — 60d transcript capture (leaddutyfish s5601,
DUTYFISH_B=1), widening voiced on day 2 only. Read in full
(evidence/2026-10-20/sense-dutyfish-b-s5601.txt, 5486 say lines).

- **The widening's fiction coheres.** "🎣 The pantry is thin (~2 days of
  fresh left). The creek crew doubles up — 3 more hands to the nets. What
  the water gives, the village keeps." One line, placed naturally in the
  evening flow, and the number is the decision-time reading (the proof
  caught the first build reporting the post-donation posture).
- **The throttle stack is VISIBLE and honest — and it caps the arm.**
  The morning after the widening, the fish duties resolve: "🌿 …checks the
  pantry before heading out — the shelves are full, ~5 days of fresh on
  hand… leaves the fish nets standing and turns to the wood run instead.
  The pantry can't take more; the wild will keep." The scholar's evening
  donation filled the shelves overnight, so the throttle honestly
  redirected the widened fishers to wood. Both lines are true at their
  hour (the sharelean sense precedent: the pantry genuinely swings
  intraday on thin days) — but it means the widening lands FISH only on
  days when dawn STAYS lean past the evening donation. The pilot measures
  the net; the arm's power is concentrated on deep-lean days.
- **Refusals are honest.** "A man, maybe 50s shakes their head. 'Ask
  someone who trusts you.' (Trust too low.)" — a widened assignment
  refused at trust < 10; the layer counts only r.ok as staffed (D7).
- **Villagers act like people.** Day 1: strangers ("A person, maybe 20s"),
  low trust, water runs, a tired cook applying to join ("I saw you on the
  broadcast. You looked like people who eat."), Xavier achy and wrung out.
  Day 2: names learned around the fire (Ingrid, Giulia, Somchai), gossip
  mutating in retelling ("It's barely the same story now"), teaching
  (Mediation, Camp Cooking, Tireless Stride), lingering by the fire. Nothing
  robotic attributable to the layer.
- **Power note:** the widening fired on 1 of 60 days on this seed — the
  village built the pantry up fast and kept it fat at daily-start. The
  8-seed pilot will say whether that's typical or seed luck.

## Convergence state

[PENDING]

## RECOVERY NOTE (main agent, 2026-10-20 ~07:15 CDT)

Loop B run fleshout-loop-b-20261020T0930Z timed out at 7200s with this arm's
worker dead (no live processes, heartbeats 2h stale). State at recovery:

- VERIFIED: scripts/test-dutyfish-b.js 15/15 GREEN (re-run by main agent with
  FEASTSCALE_R13=1 per the Usage line; an envless run fails G3/G6 by design —
  same trap as the tablepathdriver proof). The worker's 15/15 claim is honest.
- INCOMPLETE: det-gate 0/16 pairs (progress journal empty — the service-restart
  kill + box-load slowness ate the attempt); pilot sweep NEVER ran. No verdict.
- Sense transcript read in full by the worker (sense-dutyfish-b-s5601.txt);
  the throttle-stack honesty finding is recorded above.

This arm is NOT killed and NOT judged — it is parked mid-flight with a green
proof. The layer is default-OFF (DUTYFISH_B unset → pure delegation), so the
commit is inert. Next loop B run: resume from det-gate (the journal at
~/workspace/detgate-dutyfish-b-progress.jsonl resumes), then pilot 16 configs.
Do NOT re-run the proof from scratch — it is verified green on this commit.
