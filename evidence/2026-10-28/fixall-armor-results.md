# fixall-armor round 3 — results: HELD / NO-GO on confirm (pilot GO, confirm fail)

Pre-registered bars (evidence/2026-10-28/fixall-armor-prereg.md) bind.
A miss is NO-GO, never re-scored mid-run. This run does NOT merge.
Nothing below changes the bars; the metric-review section is for the NEXT
run only. Branch fixall-armor is KEPT (not merged, not reverted) so the
next round adopts the built work instead of re-doing it; live play is
untouched, zero trace on master.

## Plain-words picture

Villagers can now sew armor in live play — the switch is on, the pile-draw
path is on, and bark arrives twice as fast. On the pilot villages the fix
landed exactly where round 2 missed: sewing on 6 of 8 villages (round 2:
5), a finished piece on 6 of 8 (round 2: 4), 71 attempts and 50 crafted
pieces (round 2: 38 and 20). The village that round 2 diagnosed as
bark-starved now sews 14 pieces. But on twelve FRESH villages the same fix
reached only 6 of 12 with an attempt and 4 of 12 with a finished piece —
because half of fresh villages never get a villager home wearing armor in
the first place. Sewing works wherever it can start; starting it is the
remaining gap, and starting it is a seeding question, not a sewing
question. So the work is held, not killed: the conversion is proven, the
breadth bar for fresh villages is not met, and the cause sits upstream of
the sewing beat (see "Exact remaining gap").

## Pilot band (identical before/after)

Seeds 67601–67608, policy leadfeast + armorydrive stack, 180 days,
death-aware, NO ARMORVILLAGE flag in either leg (the live-play condition).
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
KILLDISC=1 ARMORYDRIVE=1.

| seed | before att/cr | after att/cr | after recipe-coin / knowers | after survival | after end |
|------|---------------|--------------|-----------------------------|----------------|-----------|
| 67601 | 0 / 0 | 7 / 5 | 5 / 77 | 169 | village-lost |
| 67602 | 0 / 0 | 12 / 9 | 7 / 113 | 181 | survived |
| 67603 | 0 / 0 | 4 / 3 | 2 / 82 | 154 | village-lost |
| 67604 | 0 / 0 | 22 / 16 | 12 / 151 | 180 | survived |
| 67605 | 0 / 0 | 19 / 14 | 12 / 114 | 139 | village-lost |
| 67606 | 0 / 0 | 7 / 3 | 9 / 84 | 181 | survived |
| 67607 | 0 / 0 | 0 / 0 | 0 / 46 | 51 | village-lost |
| 67608 | 0 / 0 | 0 / 0 | 0 / 0 | 181 | survived |
| TOTAL | 0 / 0 | 71 / 50 | 47 / — | — | — |

Before-band stash days (bark/vine/hide): 0 on every seed — the starved
precondition reproduces on current master. After-band stash days per seed
(bark/vine/hide): 67601: 131/43/136; 67602: 158/140/126; 67603: 111/117/39;
67604: 155/43/149; 67605: 104/73/55; 67606: 136/122/62; 67607: 7/0/0;
67608: 152/149/116. Branch/wood stash days after stay high on every
surviving seed (109–157) — the mix shift did not starve tool materials.

## Pilot bars — judged

- B1 attempts > 0 on ≥6/8 seeds: **PASS — 6/8** (67601, 67602, 67603,
  67604, 67605, 67606). Round 2 failed this bar 5/8; round 3 clears it.
- B2 recipe-matched coincidence-or-attempt among knower-seeds:
  **PASS — 6/7** (all-but-one of the 7 seeds with knowersDays > 0; the
  one miss is 67607, 0 coincidence days and 0 attempts on 46 knower-days
  before its day-51 collapse). This is the STRICTER corrected metric
  (recipe matched to wearer); round 2's over-broad metric would have
  scored higher, not lower.
- B3 crafts ≥ 1 on ≥5/8 seeds: **PASS — 6/8** (67601: 5, 67602: 9,
  67603: 3, 67604: 16, 67605: 14, 67606: 3). Round 2 failed this bar 4/8.
- G1 guardrails: **PASS.** Starvation deaths 2 after vs 3 before (≤2×
  holds). Total deaths 367 after vs 332 before (+35; see note below).
  New cause labels absent before — "The Ugly Beast" (1), "alien" (1),
  "betrayal" (1) — are singletons of the same class as before-band
  singletons (Loud-Eyes, Ugly-Eyes, Choir Toad, Cliffhanger, lockjaw);
  no new systematic cause kind appeared. The game diff touches no social,
  trust, or betrayal code, so no mechanism links the armor change to the
  single betrayal death. Total-deaths note (reported, not a bar): deaths
  per survival-day rise 0.274 → 0.297, driven by combat categories
  (combat 143→156, villager combat 74→89, the wild 42→52) while
  armor-wearing rises (final worn bark 3→7, hide 0→3) — counter-directional
  to any armor-harm story, and the two legs' timelines diverge chaotically
  after the first inflow RNG difference, so the +35 is not attributable to
  the change; it is disclosed, not hidden.
- G2 no-substitution: **PASS.** The game diff touches ONLY src/js/
  storage.js (the inflow beat) and the gate lines of src/js/
  villager-build.js (`villagerArmorCraftDay` + step 3b of
  `villagerGearDay`); recipes, odds, cooldown, knowledge, and all gating
  files untouched. The proof test asserts the knowledge gate, the
  cooldown, and the pile draw.

**Pilot verdict: GO on all bars.**

## Confirm band (fresh seeds, after-code only)

Seeds 67701–67712, same policy/horizon/env, after-code only (anchor
8226824cd395232ceaa4d93f331f6d5dd285f0a4 — the after-band commit).

| seed | att / cr | recipe-coin / knowers | survival | note |
|------|----------|----------------------|----------|------|
| 67701 | 0 / 0 | 0 / 0 | 112 | sole knower away all 112 days |
| 67702 | 18 / 9 | 10 / 163 | 181 | loop running, 7 bark + 1 hide worn |
| 67703 | 19 / 6 | 12 / 46 | 181 | 5 bark worn |
| 67704 | 0 / 0 | 0 / 0 | 104 | no knower |
| 67705 | 0 / 0 | 0 / 0 | 135 | no knower |
| 67706 | 3 / 0 | 3 / 22 | 148 | attempts, no success yet |
| 67707 | 0 / 0 | 0 / 0 | 131 | no knower |
| 67708 | 0 / 0 | 0 / 0 | 150 | no knower |
| 67709 | 1 / 0 | 0 / 0 | 108 | transient home window, 1 attempt |
| 67710 | 6 / 4 | 2 / 10 | 151 | seeded day 133, then loop ignites |
| 67711 | 21 / 13 | 10 / 139 | 181 | loop running, 7 bark worn |
| 67712 | 0 / 0 | 0 / 0 | 181 | no knower |
| TOTAL | 68 / 32 | 37 / — | — | — |

## Confirm bars — judged

- C1 attempts > 0 on ≥9/12 seeds: **FAIL — 6/12.**
- C2 crafts ≥ 1 on ≥8/12 seeds: **FAIL — 4/12.**
- C3 guardrail: **PASS.** Starvation share 4/546 = 0.73% vs pilot
  before-band 3/332 = 0.90% (≤2× holds). Death-cause kinds absent in the
  pilot before-band ("Extended Warranty", "thirst", "The Influencer",
  "The Congregation", "The Algorithm", "Big Big") are 1–2 deaths each,
  max 0.37% of confirm deaths, all below the 10% bar.

**Confirm verdict: NO-GO. Overall round-3 verdict: HELD / NO-GO**
(pilot GO + confirm fail = held, per pre-reg).

## Exact remaining gap (the confirm's finding)

The confirm did not find a conversion failure. It found a seeding
failure, and it quantified it:

1. **Only 5 of 12 fresh villages ever show a home knower at snapshot
   (6 of 12 with any attempt).** The pilot seeds (67601–67608, chosen in
   round 1 as the armorvillage pilot seeds) had knowers on 7 of 8 — the
   pilot population was seeding-rich, so pilot bars measured conversion
   on villages where conversion could run. Fresh villages seed at about
   half that rate. Where a knower IS home, conversion fires: 6 of 6
   activity seeds attempted, 4 of 6 crafted; among snapshot-knower seeds,
   5 of 5 attempted and 4 of 5 crafted.
2. **Seeding is stochastic and sometimes very late.** Seed 67710 had no
   knower until day 133, then the loop ignited immediately (6 attempts,
   4 crafts, 5 wearers within 10 days via the spares flow). Seed 67701's
   only knower wore bark armor from day 2 but was AWAY on all 112
   snapshots — an away-knower cannot sew, and the craft beat correctly
   requires home. Seed 67709 attempted once through a transient home
   window its snapshots never caught — snapshot knower-days undercount
   opportunity when villagers move in and out.
3. **What this round did NOT fix:** the bot band has no deposit source,
   so the ungated pile draw (lever c) could not seed any confirm village
   — it is proven only at unit level (proof E6) and by the live-play
   chain (player crafts → deposits → villager wears → knower → sews).
   Bark widening fixed the 67605 timing trap (19 attempts / 14 crafts,
   where round 2 had 0 / 0) and broke 67604's first-success trap (22
   attempts / 16 crafts, where round 2 had 8 attempts / 0 crafts) —
   without touching odds. But neither lever creates a first piece where
   none exists.

## Diagnostics (reported, not judged)

- D1 geared outcome: pilot final worn bark 3 → 7, hide 0 → 3; confirm
  final worn bark 20, hide 1 across 12 villages (67702: 7 bark + 1 hide;
  67711: 7 bark). Crafted pieces end up worn (proof E4 asserts the
  spares-flow path; confirm 67710 shows the cascade live: 1 wearer →
  gifts → 5 wearers in 10 days).
- D2 hide channel: pilot hide crafts on 67606 (3 pieces, 3 hide worn at
  end); confirm hide worn 1 (67702).
- D3 branch/wood safety: no collapse (see pilot table above).

## Sense test (SENSE-TESTING LAW)

Quoted from captured band lines (seed 67605 after-band):

- "Miguel left 2 bark strips by the stash. No announcement. That's how it
  works here." — Reads as intended: quiet communal giving, material names
  are the craft materials, no fanfare. The widened bark inflow narrates
  exactly like the old branch/wood inflow, which is the point.
- "Ethan spent the afternoon at the workbench and sewed a Bark armor that
  holds together. Ethan wears it now." — Reads as intended and honest:
  the work, the piece, and the wearing in one line. This is the 67605
  story turned around: the same Ethan who in round 2 died a knower
  without ever sewing now sews and wears, and his piece then teaches
  others (67605 knowersDays 42 → 114).

## Proof test

scripts/test-fixall-armor.js, run with NO ARMORVILLAGE flag (the
live-play condition): **32 passed, 0 failed** on post-fix code (E1 inflow
mix incl. 30% bark with branch+wood still majority; E2 knowledge gate +
cooldown; E3 craft fires without the flag; E4 spares flow gears another
villager; E5 hide knower attempts; E6 pile draw without the flag).
On pre-fix code: 18 passed, 14 failed (E1, E3, E4, E5, E6 fail as designed;
E6 was tightened before the band so it cannot pass via spares flow).

## Metric review (NEXT run only — not applied here)

- **Confirm bars measured seeding, not conversion.** C1/C2 on all 12
  seeds punish the conversion for villages where it could never start
  (no home knower). The next round's pre-reg should split the question:
  a SEEDING rate (share of villages ever gaining a home knower — the
  thing to fix) and a CONVERSION rate among opportunity villages
  (knower-home days > 0 or attempts > 0 — the thing this round proved at
  6/6 attempts, 4/6 crafts). This round does not re-score itself on that
  split; it reports both numbers so the next pre-reg can use them.
- **Snapshot knower-days undercount opportunity.** Transient home
  windows (67709's attempt with 0 snapshot knower-days; 67710's crafts
  against 10 snapshot knower-days) mean the instrument should count
  attempt-days and gear/craft tele events alongside snapshots, or the
  next round will keep under-reading villages whose knowers move.
- **Pilot-seed selection bias, named.** The 67601–67608 pilot seeds are
  round-1 pilot seeds and seed at 7/8; fresh seeds seed at ~6/12. Any
  future pilot on the old seeds must be labeled seeding-rich, and
  generalization must be judged on fresh seeds with the split bars above.

## What happens to the work

HELD on branch fixall-armor (tip: after-band commit 8226824cd395232ceaa4d93f331f6d5dd285f0a4
+ this results file and the confirm JSON, committed separately). NOT
merged to master: live play is untouched, zero trace on master. The branch
is kept so the next round adopts the proven conversion (inflow + craft
ungate + pile ungate + bark mix) instead of re-doing it; the parent may
overrule and order the revert. Next round's work, in order: (1) seeding
decision (see steve-calls); (2) split bars in pre-reg (seeding rate +
conversion-among-opportunity); (3) transient-home-window instrument fix.

## Steve-calls (need Steve's ruling — NOT decided here)

1. **(steve-call) Seeding rule for fresh villages.** About half of fresh
   villages never gain a home knower in 180 days, so no sewing can start
   there no matter how good conversion is. Options, none chosen here:
   (a) guarantee one starting villager wears bark armor in every village
   (a generation change — every village starts with an armored villager);
   (b) make the old bark cuirass by the fire a real takable/wearable
   piece villagers can draw on (it is currently fiction that teaches the
   player the recipe only); (c) accept sterility as legitimate village
   variety — some villages just don't sew — and judge conversion only on
   villages where it can run. Recommendation offered, not decided: (c)
   plus split bars, because (a) and (b) change what every village starts
   with, which is a world-design call, not a tuning call.
2. **(steve-call) Away-knowers.** Seed 67701's only knower was away for
   all 112 days observed. If long/permanent away is intended (expeditions
   that long), nothing to do; if it is a stuck-away bug, it silently
   vetoes that village's whole armor loop. Flagged as an observation for
   the away-system owner, not ruled here.
