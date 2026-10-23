# sim-vetbench — veteran benching during the wave-5 window (axis scale-onramp)

Run fleshout-20261022T1915Z (loop A), arm sim-vetbench. Worker tree
sim-vetbench, base 5245f3165 (= local master at run start; branch
fast-forwarded to master tip before building).

The question: the 1717Z sim-windowloss DIAG's named runner-up — "veteran
benching during the window." The vetwindow restraint probe fired
(24 fights/28 window-days) but every window fight was a haven assault,
and restraint holds at haven by design (chooseFleeDir null at haven) —
zero disengagements, veterans still died at the haven door. This arm
closes that gap WITHOUT fleeing: while the post-veterans window is live
(VETERANS bar filled, wave-5 door shut), the 2 bar-filling veterans do
NOT join wave-4+ haven-door fights — they bench. The door is still held
by non-veterans (no fleeing, no purposeless disengagement — the
restraint's law stands).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; wave 5 = The Producers; readiness gate's VETERANS bar =
2 living roster members with wave-4+ kills in state.waveKillLog; wave-5
demand ARMORED 4×P>=15 / ARMED 6 / TRICKS 3 / VETERANS 2). The DIAG
evidence/2026-10-22/sim-windowloss.md read second. No canon doc covers
armor/equipment — stated, not invented. The shelter verb
(src/js/shelter.js) is the expressible policy-side route: sheltered
villagers are excluded from the haven raid draft (havenGrowth.js
havenRaidTick reads isSheltered), the wild router (game.js
villagerMonsterTick), and duties (mustered, not working — lost
production is the honest cost). scholar_never_auto_sheltered: the verb
skips the player's villager — the scholar's own TB fights stay the
player's (the vetwindow restraint already covers disengagement there).

## PRE-REGISTRATION (§14 binding — written BEFORE building the policy)

- PRIMARY: veteran combat deaths during live windows (bar filled, door
  shut), benching vs control, identical seeds. GO = armed veteran
  wave-4+ combat deaths during live windows <= control − 2.
- ENGAGEMENT (pre-registered exact predicate): on an armed (VETBENCH=1)
  seed, the benching ENGAGES iff the policy newly shelters ≥1
  bar-filling veteran (living roster, non-scholar, wave-4+ kill in
  state.waveKillLog, draft-eligible: health>40, not away, not already
  sheltered — the same eligibility the raid draft reads) on a day when
  the window is live (AD.w5VetBarMet && unlockedWave()<5 — the
  vetwindow probe's exact recognition). GO requires ≥2/8 armed seeds
  engaging (a seed counts if EITHER policy config engages).
- GUARDRAILS (all binding):
  - median survival ≥ control−10d (paired per-seed diffs, 16 pairs);
  - no new death mode (≥2-event rule: any cause with ≥2 armed events
    and 0 control events = fail);
  - haven breach rate ≤ control+1: an "unmet-raider raid-night" (the
    raid draft's own say-line "Nobody met … still out there at the
    treeline") counts a night the door was not fully held; armed total
    ≤ control total + 1. A benched-veterans haven that falls over is a
    fail.
- SECONDARY: wave-5 doors opened (does keeping veterans alive let the
  window survive to the armor leg?).
- Design: 8 FRESH seeds (filename-verified) × {leadfeast, belongfeast}
  × {control, vetbench} = 32 configs, 180d death-aware, paired
  identical seeds, on the non-seat long substrate:
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 (VETREL/REPOSITION/VGEAR unset;
  VETWINDOW unset both arms — the restraint is a separate measured
  arm, not composed here).
  - control  = armorydrive stack (ARMORYDRIVE=1, VETBENCH unset)
  - vetbench = the benching layer OUTSIDE the same stack
    (ARMORYDRIVE=1, VETBENCH=1)
- Instruments: KILLDISC=1 v2 (killdisc-instrument-20261021.js) + daily
  w5-readiness census + kill-time bearer census + vetbench counters
  (counts only) + unmet-raider say-line capture + veteran death rows
  during live windows. Before/after through scripts/balance-panel.js
  per §15 — the panel is the instrument, this header is the judge.
- PILOT: the 32-run sweep IS the pilot (8 seeds). Confirm (12–16 fresh
  seeds) ONLY if pilot GO.
- A miss is NO-GO, never re-scored against a friendlier metric mid-run.

## Proof gates — results (2026-10-22 ~23:36–00:35 UTC, anchor 5245f316578c)

scripts/test-vetbench-20261022.js: **28 PASS, 1 FAIL**.

Post-rebase re-verification (anchor 8507d9d48b6a, sibling src/js commits
naming-rite/villager-objectives): **28 PASS, 1 FAIL — same profile.**
E5 on the new anchor: s65477-belongfeast's window shrank 8 days → 1 day
(trajectory shift from the rebase), still muster-covered
(musterActiveWindowDays=1, musterCovered=1), still zero engagement. All
other gates GREEN on the new anchor.

- E0 shape (5/5): exports, normBase, id tags, substrateFor == armorydrive
  stack, vbOn reads VETBENCH. GREEN.
- E1 det-gates (2/2): VETBENCH-off vetbench trajectories byte-identical
  to control, 60d × {s65411 leadfeast, s65412 belongfeast}. GREEN —
  composition honesty pinned.
- E2 env-gate: folded into E0e (vbOn reads VETBENCH exactly). GREEN.
- E3 synthetic RED→GREEN (13/13): window-live fixtures (filled+shut /
  unfilled / open / read-error fail-closed); benching-set computation
  (2 living non-scholar wave-4+ killers; dead/scholar/non-killer
  excluded); benching FIRES on a live window (base daily called,
  shelterVillagers with the eligible veterans, engagement counters,
  beat said once per vid — protective + chafing); stand-down on window
  close (release + beat, vbMine emptied); gate-off pure delegation;
  muster-active no-release; scholar-becomes-benched-veteran released.
  GREEN — the mechanism works as designed.
- E4: 180d VETBENCH=1 run completes + D2 byte-identical (s65421
  leadfeast). GREEN.
- E5a: live window found on the real stack (s65477 belongfeast, 8
  window days). GREEN.
- **E5b: RED.** On the only live window in the 4 scanned configs
  (s65477×2 + s65475×2), the bench never newly sheltered a veteran:
  all 8 window days were game-muster-active (musterActiveWindowDays=8,
  vbMusterCovered=8) — the sole non-scholar veteran was already
  sheltered by the game-side auto-muster. The scan was fixed mid-run to
  NOT break at the first live window (it now scans all 4 configs and
  reports muster state); the predicate is unchanged. Root cause (not a
  layer bug): the game-side auto-muster (src/js/shelter.js,
  shelterMusterCheck, journey crisis r20 2026-10-17) shelters EVERYONE
  when a wave-4+ threat is near the haven — the bench's eligible set is
  empty on muster days, correctly (double-sheltering would be pointless).
  No policy-side fix exists for this; the layer correctly stands down.

Gate note: E5b-as-preregistered is RED. The mechanism itself is proven
(E3/E4); the failure is environmental (muster coverage on the sampled
window), not a layer defect. Per kill discipline (root-cause before
killing), the armed half of the pilot sweep was run as the empirical
tiebreaker — those 16 runs double as the pilot's armed data.

## Pilot results — 32 configs (8 seeds × {leadfeast, belongfeast} × {control, vetbench}), 180d death-aware

- **PRIMARY: NO-GO.** Veteran combat deaths on live-window days:
  control=0, armed=0 (GO needed armed ≤ control−2). Zero window deaths
  in either arm — there was nothing to prevent.
- **ENGAGEMENT: NO-GO.** 0/8 armed seeds engaging (GO needed ≥2).
  Window-live days across all 16 armed runs: 3 (one seed,
  s65556-belongfeast, days with the door shut and bar filled) — and all
  3 were muster-covered (vbMusterCovered=3, benched=0). The other 15
  configs: 0 window days.
- **GUARDRAILS: all PASS** (trivially — trajectories identical):
  median paired survival diff 0d (≥−10d); no new death modes;
  unmet-raider nights 94 vs 94 (≤ control+1).
- §15 panel (scripts/build-vetbench-panels-20261022.js →
  vetbench-panel-primary.{md,json,json.gz×2}): control→vetbench,
  decision review_required; every observed metric no_material_signal,
  paired delta 0. The panel is the instrument, this header the judge:
  **NO-GO. No confirm.**

### Why the window never lives here (the mechanism-level finding)

The VETERANS bar (2 living roster members with wave-4+ kills) effectively
never fills on the pilot corpus: w5vetsMax was 0 on 13/16 armed configs
and 1 on 3/16. Villages die at 36–163d (median 102d) having produced at
most one non-scholar veteran. The two wave-5 doors that opened did so
with the bar filled via the SCHOLAR (mantle promotion keeps promoting
veterans to scholar — the vetwindow DIAG's Saleh→Shuting→Sanne pattern):
bar = {1 non-scholar vet + scholar}. On s65556-belong the 3-day window
that resulted was fully game-muster-covered.

Deeper: on the armorydrive stack the armor bar and the veterans bar
arrive together — when the 2nd veteran appears the door opens the same
day (0 window days). The bench's operating condition (bar filled, door
shut, muster-free day) is a rare state on this substrate, not a
mechanism failure. The DIAG corpus (sim-windowloss seeds) did show
28 window-days — seed-dependent, and there the restraint fired but held
at the haven door by design.

### Wall numbers (pilot, identical both arms)

national 4/16, table 10/16, wins 0/16, wave-4 doors 11/16, wave-5 doors
2/16, median survival 102d, max 162d. (Table=10/16 is tableWaiting/Done;
wins stay 0 — the win needs the seat stack, per the scale-wall baseline
regime note.) Death-cause shares identical both arms: combat 376,
villager-combat 116, expedition 19, starvation 14, ambush 10, alien 7,
sickness 5, contest 7, dehydration 4, the night 3, thirst 2, monster 23,
wound-unclosed 5, plus named-monster kills (Grief Counselor, The Audit,
The Suburb ×2, Gavel).

### Telemetry deviation check (§15 step 10)

`telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json`
→ **LOUD: wins disappeared (baseline 16 → current 0)**. This is the
baseline's own documented regime artifact (scale-wall.json is the
WINSEAT regime: SEATDRIVE=1 full win stack; this run is the non-seat
substrate where wins are structurally ~0). NOT rolled forward
(--update-baseline would destroy the winseat _regime label). No
investigation item.

## Village assessment (plain words)

Sixteen villages on the armorydrive stack, and the story is the same in
all of them: they fight well into wave 4 (11/16 reach it), a few even
crack the wave-5 door (2/16) and get the table's attention (10/16), but
they die at a median 102 days — starved, mauled, or ground down — before
they ever field two living veterans at once. The veterans bar is the
binding constraint, and the mantle keeps eating it: the moment a
villager becomes a proven wave-4 killer, they're also the likeliest next
scholar, and the scholar doesn't count for the bench. The bench stood
ready all run and never once had a veteran to shelter — not because the
village didn't need it, but because the village never got there.

## Sense-test (SENSE-TESTING LAW)

No benching beats exist (0 engagements — nothing to judge; the beat
text was verified in E3: protective, chafing, people-like). Read the
window-adjacent transcript instead
(evidence/2026-10-22/vetbench-transcript-s65556-belongfeast.txt,
s65556-belongfeast armed, the one config with a live window):
- The muster beat (day 62) reads like people: "scouts report The
  Influencer hunting near Haven, and it is beyond us. Everyone inside.
  No one walks the treeline alone — the garden crews double up, the
  hunters stand down. We outlast it."
- Unmet-raider nights (days 41/59/79/100/120) are coherent and
  consequential: "Nobody met X — it's still out there at the treeline.
  It'll gorge every night until it's driven off." Day 79 has three
  unmet raiders while the muster holds everyone inside — the village
  chose outlasting over feeding the door, and the cost (nightly
  gorging) is legible, not silent.
- The SYSTEM veteran-kill beat (day 75: "Sari just put down The
  Influencer... on CAMERA. That's a veteran kill, folks. REMEMBER the
  name.") is the show-voice working as designed.
- The counter-learned beats (day 8, Murkcap sporefall) are
  knowledge-gated and fire-voiced.
Verdict: the fiction around the window reads sensically. No robotic,
static, or repeated beats found in the sample.

## Metric review

- The E5 pre-reg named s65477 × leadfeast/belongfeast as "the known
  window configs." s65477-lead had 0 window days; s65477-belong's
  8-day window was fully muster-covered. The scan now covers all 4
  listed configs without early break — same predicate, wider sample.
- The PRIMARY (armed ≤ control−2 on window vet deaths) is unmeasurable
  when the window never lives. For a future retest on a
  window-producing substrate, the engagement predicate (≥2/8 seeds) is
  the better primary — it measures the mechanism's opportunity, not
  just its outcome. Proposed for the next run, not this one.
- The bench's operating condition needs all three at once: bar filled
  + door shut + muster-free day. A future arm could widen the aperture
  (e.g., bench on bar-filled days regardless of the door), but that's
  a design change for the coordinator, not this run.

## Blanks filled / documented

- FILLED: the E5 scan's early-break (test now scans all configs);
  the muster-interaction root cause (documented in the layer header
  comments and here).
- DOCUMENTED (findings backlog): the game-side auto-muster substantially
  covers the vetbench window — any future veteran-protection arm must
  reckon with shelterEveryoneBut. The VETERANS bar fills via the
  scholar on this substrate (mantle-promotion pattern) — the bar's
  second member is often un-benchable by design.

## Convergence

Axis scale-onramp, arm sim-vetbench: **killed-at-pilot** (NO-GO:
primary unmeasurable, engagement 0/8). The wave-5 door remains the
binding wall — this arm did not move it (2/16 doors both arms,
identical trajectories). The scale-onramp axis is NOT converged.

## Files

- evidence/2026-10-22/sim-vetbench.md (this file; pre-reg + results)
- evidence/2026-10-22/perseed-vetbench/*.json (32 per-seed pilot JSONs,
  filename-verified)
- evidence/2026-10-22/vetbench-panel-primary.{md,json} +
  vetbench-panel-primary-{before,after}.json.gz (§15 compare; no case
  caches)
- evidence/2026-10-22/vetbench-transcript-s65556-belongfeast.txt
  (sense-test sample)
- scripts/policies/vetbench.js (the layer; VETBENCH=1 opt-in, default
  off, zero src/js — retained inert per the sim-vetwindow NO-GO
  precedent; never engaged in the pilot)
- scripts/test-vetbench-20261022.js (proof: 28 PASS, 1 FAIL — E5b RED
  as documented above)
- scripts/det-vetbench-20261022.js, scripts/diag-vetbench-20261022.js,
  scripts/diag-readpurity-20261022.js (proof/diagnostic drivers)
- scripts/sweep-vetbench-20261022.js (32-config pilot sweep),
  scripts/analyze-vetbench-20261022.js (pre-reg judge),
  scripts/build-vetbench-panels-20261022.js (§15 panel builder),
  scripts/capture-vetbench-transcript-20261022.js (sense-test capture)
- Anchor: proof 5245f316578c; sweep anchor recorded per-seed JSON
  (anchorCommit).
