# sim-helpcall2 — aid-engaging policy re-run on the FIXED crisis-tier substrate (2026-10-17)

Run: fleshout-20261017T1102Z · axis: scale-onramp (blocking) · arm: sim-helpcall2.
Worker: village assessor. Policy-side only — zero src/js changes (loop B owns
src/js/game.js + src/js/engine/calories.js this run; scripts/ + evidence/ only).

## Pre-registration (BINDING — docs/MEASUREMENT.md §§9–12, 14, written BEFORE the sweep)

**The arm.** scripts/policies/helpcall.js (withHelpCall(base,id,desc), HELPCALL=1,
default OFF, zero src/js): on an apex raid crisis (crisis.raiders && wave>=3,
no call placed yet) the policy calls Game.callForHelp('runner', {}), recording
every placement + every aidAskVillage verdict into Game.state.hcLedger.

**PRIMARY (binding):** post-invite raid-attributed deaths (fieldfightsrc
tagging: havenRaidTick's `opts.raid` or the raiders' `m.lingering`, engine
markers never reconstruction; post-invite = death day >= invite day, the
tableWaiting rising edge) — armed <= 0.75x own paired control.
GO = sum(armed post-invite raid deaths) / sum(control post-invite raid deaths)
<= 0.75, on identical seeds, own in-sweep paired control.

**DIAGNOSTIC SECONDARY:** aid-call attribution — every aid call on apex raids
classified accepted/refused (100% attribution required: unattributed must be
0); acceptance share reported (not judged).

**GUARDRAILS (binding):** national armed >= control − 2; exiled 0 (armed);
matched non-win median survival armed >= control − 10d; no new death mode at
n>=3 armed.

**Decision rule:** PRIMARY miss = NO-GO, never re-scored against a friendlier
metric mid-run. Metric doubts go under "metric review".

**Substrate:** SEATDRIVE=0 explicit (the seatdrive wrapper is not composed —
the driver is truly off; pre-seat courtship), FEASTSCALE_R13=1, TRIBFLOOR=1,
SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1, WINDEFER=1, ALLOWGATE2 unset,
NODEWITNESS unset. Policies: withHelpCall over tribfloor's
leadfeast/belongfeast (tribfloor wraps feastscale's leadfeast/belongfeast;
with TRIBFLOOR=1 the tribfloor layer is active on BOTH sides). Armed =
HELPCALL=1; control = identical stack with HELPCALL explicitly unset (never
HELPCALL=0 — unset is the true default-OFF path).

**Seeds:** 8 FRESH [962, 963, 964, 965, 966, 967, 968, 969] — collision-checked
as `-s<seed>.` literals against evidence/ filenames before the run; 961 hit
evidence/2026-10-16/sim-execensus.md and was replaced by 969 (0 hits).
× {leadfeast, belongfeast} × {armed, control} = 32 runs, 180d death-aware.

**Horizon:** 180d death-aware. **Schema:** per-seed JSONs carry numeric
national/table/wins/exiled keys (evidence/2026-10-17/perseed-helpcall2/).

**Instruments:** scripts/test-helpcall2-20261017.js (proof) ·
scripts/sweep-helpcall2-20261017.js (paired sweep, wrong-side guards,
invite-day capture, improved aid-beat recorder) ·
scripts/analyze-helpcall2-20261017.js (verdict analyzer).

## Canon read

No dedicated raids/aid canon doc exists (CANON.md's manifest lists
DISEASES/BEAR/PRESERVATION/MONSTER-WAVES/CONTESTS/etc. — none covers the
call-for-help chain). Per the brief, stated instead of invented: the design
authority is the engine's own ontology header (src/js/comms.js: the four
tiers, honest costs, refusals aloud/fast, the wave>=3 apex penalty in
aidAskVillage) plus PROGRESSION.md "When a monster shows up at your door"
(runner / signal / system relay / cry) and the DESIGN.md 2026-10-10
survival-safety-nets entry (neighbor-village aid flows: real runner, real
decision, real deliveries from finite neighbor pantries; the request move is
knowledge-gated).

## Proof (scripts/test-helpcall2-20261017.js) — 26/26 GREEN

- Unit (14/14, fake Game): apex-only firing; ledger tier/wave/ret; hook
  installed on placement path; verdict recorded; no repeat placement; non-
  placement re-attempts are recorded attempts never phantom placements;
  gating taxonomy (no-crisis/resolved/not-raid/sub-apex/already-called);
  gate-off = pure delegation (no call, no hook, no ledger, no ctx trace);
  default unset = OFF; HELPCALL=1 ON; HELPCALL=0 OFF.
- Engine-true (5/5, loadGame seed 962): raiseAidCrisis returns the crisis
  (wave 4); real callForHelp placed on the apex raid crisis; ledger matches
  the engine tail entry (or the honest no-tail contract on non-placement
  returns); real verdict recorded by the hook; re-attempt adds an attempt,
  never a phantom placement.
- Control-nakedness (2/2): the unwrapped tribfloor stack with HELPCALL
  unset, run live 20d — no hcLedger, no hook installed. Layer markers are
  honest on both sides: armed records, control is silent.
- Det-gate (1/1): HELPCALL=0 armed-object vs the unwrapped tribfloor stack,
  seeds 962/963/964 × 60d — self-pairs AND cross-pairs byte-identical
  (end reasons matched). Gate-off is structurally pure delegation; the sim
  pins it on the new substrate.
- SMOKE (4/4): armed stack 20d × {leadfeast, belongfeast} — clean ends, zero
  aid-system errors.

## Results

Sweep complete 2026-10-17: 32/32 runs finished (16 pairs), 0 dropped, exit 0.

### Wall numbers

| | armed | control |
|---|---|---|
| national | 10/16 | 11/16 |
| table (invited) | 12/16 | 12/16 |
| wins | 0/16 | 0/16 |
| exiled | 0/16 | 0/16 |
| wave 4–5 unlocks | 0/16 | 2/16 |
| median survival | 155.5d | 172d |
| max survival | 182d | 182d |
| total deaths | 728 (45.5/run) | 771 (48.2/run) |

### PRIMARY: GO — 0.467x <= 0.75x

Post-invite raid-attributed deaths (engine markers, invite-day gated):
**armed 14 (0.88/run) vs control 30 (1.88/run) — ratio 0.467x. GO.**
(Ungated raid deaths: armed 39 vs control 55 — the effect is concentrated
post-invite as pre-registered.) 4/16 pairs had no invite (excluded from the
primary on both sides).

Paired deltas (armed−control): s962 0/0; s963 −2/+1; s964 0/−3; s965 0/0;
s966 −2/−2; s967 −1/−1; s968 −4/0; s969 0/−2. Seven pairs negative, one
positive (s963 leadfeast +1), eight ties. The reduction is systematic across
pairs, not driven by one outlier.

### SECONDARY: attribution 100%, engagement 3x the prior arm

- Placements: 38. Engine returns: sent 33, nolink 2, died 3.
- Verdicts: accepted 30, refused 3 — every sent placement matched
  (unattributed 0, en-route-at-run-end 0). 100% attribution: requirement met.
- Aid arrivals: 18 parties, 69 fighters (ledger `aid-arrived:` events).
- Aid-system errors: 0.
- Acceptance share: 0.909 (30/33 judged) — reported, not judged.
- Placements by crisis wave: wave-3: 23, wave-5: 15, wave-4: 0. (The
  crisistier fix is what makes these fire at all — pre-fix every raid
  crisis read wave 1 and the wave>=3 gate would never open.)

Engagement volume (38 placements / 30 acceptances / 18 arrivals) is ~3x the
prior arm's (13 / 8 / 3). See "brief correction" in metric review — this is
not the same substrate as the prior arm.

### Guardrails

- **national ≥ control−2: HOLD** (10 vs 11).
- **exiled 0 (armed): HOLD** (0).
- **matched non-win median survival ≥ control−10d: VIOLATED** — armed
  155.5d vs control 172d (need ≥ 162d). All 32 runs are non-win, so this is
  the full-set median. Sign test on the 7 non-zero paired deltas: 2
  positive / 5 negative, two-sided p ≈ 0.45 — not statistically
  distinguishable from noise, but the pre-registered bar binds regardless.
  The worst pair (s966 leadfeast, −112d) was sense-read: the village died
  of multi-front human-raid attrition (800–2,400 kcal/night stripped,
  Trust −10 each), not of the aid call — the runner's road death was one
  loss among many. The aid layer fires when the village is under apex
  attack, so engagement marks villages already in distress; the
  counterfactual is not observable here.
- **no new death mode at n>=3: VIOLATED on the letter** — `aid-runner`
  appears 3× in armed, 0× in control. It is NOT a novel pathology: the
  cause exists in comms.js by design ("the road can take them"), it is the
  documented honest price of the runner tier, and the prior arm disclosed
  it at n=2. Cost/benefit on this sweep: 3 runner deaths vs 16 prevented
  raid deaths. (Metric review proposes the re-registration.)

## Sense-reads (SENSE-TESTING LAW — transcripts, not counts)

**Acceptance — leadfeast s967, d138–144 (armed).** A wave-3 apex raid (Big
Ugly, Big-Eyes, Big Big, The Loud Beast, The Big Beast) hits at night; the
🚨 beat names the four options aloud. d139: "Nora sprints for Thornfield —
1 day-part each way, and the road isn't safe. That's the price. They're
gone from Haven's hands until they're back." d140: "'Old friends don't
count the grain,' says Oscar Okafor of Thornfield. '4 of us — we're coming.
Hold the door.' (Trust 100 — the cost lands in trust, not tribute.)" /
"🥁 Oscar Okafor of Thornfield walks in with 4 — Oscar Okafor. 'We're here.
Where's the teeth?' (They showed up. Trust remembers.)" d141: "Oscar of
Thornfield heads home — the door is quiet. The debt stands." d142: second
raid, Desmond sprints; d143: acceptance again, PLUS a food delivery —
"🏃 Oscar of Thornfield walks into Haven unannounced, pack-mules behind.
'Heard your bins are echoing. Thornfield has grain to spare — 2,661 kcal,
no tribute, no ceremony. Say the word.'" / "You accept Thornfield's food —
2,661 kcal on the road, 2 day-parts out. Oscar clasps your runner's
shoulder. 'That's what the fire network is FOR.' (Trust +4.)" d144: the
baskets arrive, "real pieces, honestly counted."
Verdict: the village reads as people choosing to stand with you — named
runner (Nora Wilson), named ally (Oscar Okafor), a real linked village
(Thornfield), honest costs, real kcal, trust moving both ways. Not noise.

**Refusal — belongfeast s963, d121–122 (armed).** A WAVE-5 call: "Ava
sprints for The Red Table — 1 day-part each way, and the road isn't safe.
That's the price." d122: "Ava turns home from The Red Table —
empty-handed." / "Ava is back from The Red Table — empty-handed — The Red
Table said no." The refusal is aloud, fast, attributed — and it is the
crisistier fix working: a wave-5 apex raid honestly priced (score −10),
refused where the broken substrate would have priced it wave-1. The same
village accepted 3 other calls — verdicts vary by raid, the pricing is
honest per-raid, and the ongoing food-sharing relationship (regular 🎁
deliveries from Ellis of The Red Table through the run) survives the
refusal.

**The −112d pair — leadfeast s966, d50–70 (armed).** The village is under
siege from all sides: Emberhold/Stonebridge/Ashford/Red Table strip
800–2,400 kcal/night (Trust −10 each); a wave-3 apex monster raid hits d51;
the aid call goes out d52 and the runner dies on the road. The village is
lost d70 with the pantry at ~0. The beats read as a village losing a war
of attrition on two fronts — the runner's death is one casualty among
many, not the cause. (Template note: "Nobody's dead, but the message is
clear" repeats verbatim for every human raid — known template, not new.)

## Village assessment

Mid-climb villages on the pre-seat courtship substrate: national 10–11/16,
table invited 12/16, wins 0/16 (no seat driver — expected), median survival
155–172d. Deaths are combat deaths (62–63% `combat`, 16% `villager combat`,
9–10% `monster`) — the fieldfightsrc picture, unchanged in shape by this
arm. The armed side buries fewer total dead (728 vs 771) and loses fewer
to raids (14 vs 30 post-invite), but pays the runner's price (3 road
deaths) and shows a median-survival gap the guardrail caught.

Who thrived: the heavily-aided villages — s963 and s967 (both policies)
survived the full 182d with 4–6 placements each, national reached, table
invited. Aid engagement correlates with survival at the top end. Who died:
s962 both sides identically at 25/29d (pre-apex — the layer never fires);
the mid-game attrition pairs (s964–s966, s968–s969), where apex pressure
and human-raid stripping compound. What was missing: wave-4/5 as
PROGRESSION (maxWaveUnlocked stalls at ≤3 on 30/32 runs even as wave-5
monsters raid — filed as an open gap), and the win itself (pre-seat
substrate by design).

## Metric review (§14)

1. **Brief-premise correction (verified, not re-scored).** The brief's
   premise — "the prior arm was measured on a broken substrate
   (pre-crisistier)" — is factually wrong, and the evidence proves it two
   ways. (a) Timeline: the crisistier fix committed 2026-10-16 15:09:56Z;
   the prior helpcall arm started 17:15Z the same day — the fix was in-tree
   ~2h before the arm began. (b) Mechanism: the helpcall layer's gate is
   crisis.wave >= 3; pre-fix every raid crisis read wave 1, so the prior
   arm's 13 placements are IMPOSSIBLE on the broken substrate. The prior
   arm's null (58 vs 60 raid deaths) WAS measured on the fixed substrate.
   This arm is therefore NOT a "re-run on the fixed substrate" — it is a
   measurement on a DIFFERENT substrate: NODEWITNESS unset (prior:
   NODEWITNESS=1), TRIBFLOOR=1 active (prior: only FEASTSCALE_R13 and
   NODEWITNESS asserted; TRIBFLOOR unset means the tribfloor layer was
   gate-off pure delegation), fresh seeds 962–969. The outcome difference
   (GO 0.467x here vs null 0.967x there) cannot be attributed to the
   crisistier fix. The honest deltas are NODEWITNESS / TRIBFLOOR / seeds —
   and the engagement volume differs 3x (38 vs 13 placements), which is
   itself unexplained (apex-raid frequency may be seed- or substrate-
   driven; not investigated — named as a follow-up question, not chased).
2. **aid-runner guardrail.** The "no new death mode at n>=3" bar fired on
   the letter (3 ≥ 3). For future aid arms, pre-register `aid-runner` as a
   COUNTED COST (the prior arm's framing), not as a "new death mode," with
   an explicit cost/benefit accounting. Here: 3 runner deaths vs 16
   prevented post-invite raid deaths. The bar's intent (catch novel
   pathological deaths) is preserved; the engine-designed price of the
   intervention is not misclassified.
3. **Survival guardrail.** The bar stands as written; the violation is
   reported, not re-scored. The sign test (p ≈ 0.45) says the gap is not
   distinguishable from noise at n=16, and the worst pair's beats show
   attrition-death, not aid-death — but neither overturns a binding bar.
   Follow-up: fresh-seed replication + runner-absence instrumentation
   (named next).
4. **wave45 measurement.** maxWaveUnlocked stalls at ≤3 on 30/32 runs
   while wave-5 monsters raid (15 wave-5 placements) — progression
   unlocks and raid exposure are decoupled systems. Prior arms measured
   15/16 wave-4/5 unlocks on seeds 941–948 and 951–958 with the identical
   measurement line; the 2/32 here is a seed-set (or substrate) property,
   not an arm effect (both sides stall). Filed as an open gap; the
   reachability of waves 4–5 AS PROGRESSION on this seed set is unproven.

## Telemetry check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-17/perseed-helpcall2/*-{armed,control}.json'
--metrics national,table,wins,exiled` (run per-side: 16 files each against
the 16-run baseline; the whole-dir glob would double-count against the
baseline's n=16).
1 LOUD per side: `wins disappeared: baseline 16 -> current 0`.
**EXPLAINED, not a bug** — the scale-wall baseline reflects the full
win-side stack (seat driver landed); this arm runs the pre-seat substrate
(SEATDRIVE=0 explicit) where wins are 0/16 by construction. Same-substrate
comparison (the crisistier sweep) is 0=0. Baseline NOT rolled forward —
rolling it would corrupt the full-stack baseline with a different
substrate's numbers (the fieldfightsrc precedent, same class). No other
LOUD lines: national 10/11 vs 12, table 12/12 vs 16, exiled 0 vs 0 — all
quiet.

## Convergence state

**parked.** The lever works — PRIMARY GO (0.467x, systematic across 7/16
improving pairs, 100% attribution, 0 errors) — but two guardrails violated,
so it is NOT landed. The question "does aid engagement reduce raid deaths"
is answered yes on this substrate; the question "at what cost" needs the
cost-accounting follow-up. The layer stays (default-OFF, zero src/js) as a
measurement instrument for future arms, same as the prior arm's standing
verdict. The scale-onramp axis is not converged.

## Named next (backlog, not chased)

1. **Cost-accounting arm** (first): fresh seeds, replicate-or-refute the
   median-survival gap; instrument the runner-absence cost (villager-
   day-parts away during crises) separately from the runner-death cost;
   pre-register aid-runner as a counted cost per the metric review.
2. **Engagement-volume question**: why 38 placements here vs 13 on the
   prior arm's seeds — apex-raid frequency vs NODEWITNESS vs seeds. A
   diagnostic census, not a lever.
3. **Wave-unlock decoupling** (filed to sim-findings.md): maxWaveUnlocked
   stalls at ≤3 while wave-5 monsters raid — is wave 4–5 progression
   reachable on this seed set, or does the tracker not count raid-driven
   exposure?
4. **Tier comparison** (prior arm's named next, still open): does the
   build-gated cry tier (or earlier calling) reach the fight in time —
   the aftermath-vs-defense mechanism question.

## Proof artifacts

- scripts/test-helpcall2-20261017.js — proof 26/26 (unit 14 + engine-true 5
  + control-nakedness 2 + det-gate 1 + SMOKE 4)
- scripts/sweep-helpcall2-20261017.js — paired sweep (wrong-side guards,
  invite-day capture, improved aid-beat recorder)
- scripts/analyze-helpcall2-20261017.js — verdict analyzer
- evidence/2026-10-17/perseed-helpcall2/ — 32 per-seed JSONs (numeric
  national/table/wins/exiled keys)
- evidence/2026-10-17/helpcall2-beats/ — 32 beat files (aid-beat pattern
  extended per the prior arm's recorder-gap note)
