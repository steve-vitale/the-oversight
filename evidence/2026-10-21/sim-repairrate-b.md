# sim-repairrate-b — does the repair rate close the post-court dissolution gap?

> **COMPLETE — verdict: NO-GO → KILL PROTOCOL.** Confirm sweep (16 pairs, 32 runs) finished; proof re-run 9/9 GREEN on base 9c634ebac. PRIMARY passed (pairs-net +1 ≤ +1) but guardrails failed: median survival −22d (lead) / −26d (belong) beyond the −10d tolerance, belongfeast starvation 5 vs ≤4. Judged as written (§14 anti-drift — a miss is NO-GO). Policy layer scripts/policies/repairrate.js + probe/sense runners deleted zero-trace; instruments + corpus + this evidence land as the killed-verdict record.

Run: fleshout-loop-b-20261021T0430Z (arm sim-repairrate-b), worker tree ~/workspace/worktrees/sim-repairrate-b.
LEVER (policy-side package, zero src/js): REPAIRRATE=1 + SUCCPOLITY=1 —
the repair-rate package (scripts/policies/repairrate.js, new files, env-gated, default-OFF).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sweep sims)

- **Question**: the parent arm (sim-upkeepgate-b, NO-GO) showed the
  SURPLUSFEED post-court dissolution tradeoff is STRUCTURAL through the
  gate level: with grain flowing under lowered gates, succession-heavy
  trust decay (−8 haircuts, tribute shorts) still outruns the +8/week
  repair verb (8805/8806: trust 100→39, dissolved at 39 — one point under
  the seasoned bar). The named next is the REPAIR RATE (tending strength /
  haircut size / seasoned bar), not the pantry gate. Does the repair-rate
  package close the gap?
- **Treatment** (armed rows; control = the SURPLUSFEED substrate as-is):
  (a) REPAIRRATE=1: succession-beat gift answers — the base policies never
  call answerRenegotiation, so beats expire to silence (−6); the variant
  answers with the gift (+8, 1,500 kcal), a +14 swing per beat, additive
  repair beyond the +8/week tendLink cap ("raise tending strength").
  (b) SUCCPOLITY=1: the engine's landed experimental haircut-shrink
  (sim-succpolity 2026-10-15, GO) — polity bars read pre-death standing
  for 14d, so the realm doesn't dissolve in the funeral hour ("shrink the
  haircut / lower the bar" in its bar effect; zero kcal cost).
  Engagement attributed separately (rrBeatGifts vs graceWindows /
  loadBearingDawns).
- **PRIMARY (binding)**: post-court dissolution pairs-net (armed vs
  control) ≤ +1. A pair = one seed + one policy; pairs-net = (# pairs
  armed_diss > control_diss) − (# pairs control_diss > armed_diss) — the
  parent's binary counting. Baseline context: grandparent SURPLUSFEED
  tradeoff +3 (5v2); parent gate arm +2 (3v1). This arm's control IS the
  SURPLUSFEED substrate (SURPLUSFEED=1, base policies), so the pairs-net
  reads the repair-rate package directly.
- **GO** = pairs-net ≤ +1 AND all guardrails pass:
  - starvation deaths (armed) ≤ control + 1
  - median survival (armed) ≥ control − 10d (the parent's −35d lead
    variant×trim interaction is legible — investigate per-policy, don't
    average away; note this package's kcal cost is ~1,500×beats, far below
    the parent's 46k/run, and SUCCPOLITY costs zero kcal)
  - no new death modes (armed cause set ⊆ control cause set; per-seed
    monster-name kills are pre-existing engine vocabulary — the parent's
    honest category reading)
  - ever-national (armed) ≥ control − 2
  GO means the tradeoff is repair-elastic (evidence FOR the SURPLUSFEED
  default-ON call, with repair-rate guidance). **NO-GO** = gap persists →
  the trim's upkeep cost is structural through both the gate AND the
  repair-rate levels.
- **Seeds/method/horizon**: 8801–8808 × {leadfeast-repairrate,
  belongfeast-repairrate} × {control (SURPLUSFEED=1, package unset), armed
  (SURPLUSFEED=1, REPAIRRATE=1, SUCCPOLITY=1)}, FEASTSCALE_R13=1,
  SEATDRIVE=0, 180d death-aware (the post-court window runs ~d77–175 on
  this substrate; 180d captures it plus tails). PAIRED REUSE of the
  8801-8808 set (same documented exception as the parent — not a
  fresh-seed claim). Same-commit paired control (re-run on this base;
  NEVER compare across commits). STAGED: pilot = 8801–8804 ×
  {leadfeast, belongfeast} × {control, armed} (16 runs) first; the full 32
  only if the pilot passes its gate. Never below 8 seeds per arm.
- **PILOT GATE (pre-registered)**: proceed to the full sweep iff (1) the
  package ENGAGED (≥1 beat-gift fired OR ≥1 SUCCPOLITY grace window stamped
  across the 8 armed runs) AND (2) armed dissolutions ≤ control
  dissolutions (directional movement). Kill fast otherwise.
- **Instrument proof (pre-sweep, all must pass — scripts/test-repairrate-b.js)**:
  (a) ENGAGE: REPAIRRATE=1+SUCCPOLITY=1 on 8805/8806 leadfeast armed —
  beat-gifts fired AND grace windows stamped; (b) RED: package unset ≡
  baseline policies byte-identical (leadfeast/belongfeast, SURPLUSFEED=1);
  (c) DET: same seed twice in-process byte-identical, package unset and
  engaged. Proof ran with FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 per
  the Usage header (ENV TRAP honored).
- **Honesty bars**: the parent's link instrument reused unchanged (polity
  agreement 100% required); dissolution events come from the same
  attachLinkProbe; the SUCCPOLITY grace sensor is additive RNG-clean pure
  reads at dawn; driver rows extended additively (rr block, succScan,
  death causes).
- **Balanced panel (§15)**: inexpressible — same class as the parent
  (documented there): the treatments (REPAIRRATE=1 / SUCCPOLITY=1 env vars)
  are not part of panel case identity and the pre-registered primary is
  not a contract metric. No bogus compare shipped; the before/after is
  the paired analysis on identical seeds, commit, and instruments
  (scripts/analyze-repairrate-b.js).

## Metric review (§14 — mandatory section)

(TBD after the sweep — judged as written; a miss is NO-GO, never re-scored.)

## Canon

- docs/CANON.md read first, then docs/PRESERVATION.md. Policy-side lever
  only: the feast is the village's social engine; tribute/tend are real
  pantry outflow. New for this arm: succession beats are answerable
  (hierarchy.js answerRenegotiation: gift/visit/wait); the base policies'
  silence is a POLICY choice (they never answer), not an engine default —
  the −6 lapse is the cost of that choice. SUCCPOLITY=1 is loop A's landed
  lever (sim-succpolity 2026-10-15, GO); this arm re-tests it on a NEW
  question (post-court dissolution on the SURPLUSFEED substrate), not a
  re-litigation of succession-collapse demotions.

## Proof results (pre-sweep — 9/9 GREEN)

scripts/test-repairrate-b.js: **9/9 GREEN** (run with FEASTSCALE_R13=1
SEATDRIVE=0 SURPLUSFEED=1 per the Usage header — ENV TRAP honored).

- ENGAGE (8805/8806 leadfeast-repairrate armed, 180d): beat-gifts fired
  (3 and 5), SUCCPOLITY grace windows stamped (21 and 21), polity
  agreement 100% (agreeBad 0). Both runs: courts=1, diss=0 (villages died
  d109/d117 — chaotic seeds — with the realm intact, vs the parent's
  d142 dissolution on 8806; not a paired claim, engagement only).
- RED: REPAIRRATE/SUCCPOLITY unset ≡ baseline policies byte-identical
  (leadfeast/belongfeast, seeds 8801/8802, SURPLUSFEED=1 — this arm's
  substrate; 4/4).
- DET: same seed twice in-process byte-identical, package unset and
  engaged (2/2).

### Pilot (8801–8804 × {leadfeast, belongfeast} × {control, armed} — 16 runs, complete)

Pilot-gate decision (pre-registered): (1) ENGAGED ✓ — 27 beat-gifts fired
and 100s of SUCCPOLITY grace dawns across the 8 armed runs; (2) armed
dissolutions (binary) 4 ≤ control 4 ✓ — a tie, no harm. Directional hints
beyond the binary: belong-8801 armed dissolved once, RE-FORMED (court
d107), and held national to d180 — control dissolved and ended regional;
event counts 5v6 favor armed. Gate PASSES as written (not a failed sniff
test). Proceeding to the full 16-pair sweep (8805–8808; pilot rows kept,
merged by seed — no re-runs).

Wall numbers, pilot (paired, armed / control, n=8):
binary dissolutions 4/8 / 4/8; the full read comes from the 16-pair sweep.

## Confirm sweep (8801–8808 × {leadfeast, belongfeast} × {control, armed} — 32 runs, complete)

Same-commit pairing on base 9c634ebac: pilot rows (8801–8804) kept per the pre-registration; confirm rows (8805–8808) run fresh on this base (rr2 files; src/js byte-identical between the generating bases, verified via `git diff`). Corpus merged by seed via scripts/merge-rr2.js (pairing OK, 8 pairs/policy). Judged by scripts/analyze-repairrate-b.js (full JSON: evidence/2026-10-21/repairrate-b-analysis.json).

**PRIMARY (binding): pairs-net = +1 (aMore=1, cMore=0) ≤ +1 → PASS.** Dissolution events: armed 9, control 8. Context: grandparent SURPLUSFEED tradeoff +3 (5v2), parent gate arm +2 (3v1) — the dissolution binary keeps closing as levers stack.
- leadfeast-repairrate: pairs-net 0 (0v0). Per-pair dissolutions (c/a): 8801 0/0, 8802 1/1, 8803 0/0, 8804 0/0, 8805 0/0, 8806 0/0, 8807 0/0, 8808 0/0.
- belongfeast-repairrate: pairs-net +1 (1v0). The +1 pair is 8807: armed dissolved TWICE (d112, d126), re-formed via court (d118), held national and survived to d180; control dissolved 0× but died at d70. Binary counting penalizes the armed re-formation (metric review).

**Guardrails:**
- starvation: lead armed 5 ≤ control 6+1 ✓; belong armed 5 vs control 3+1=4 ✗ (miss by 1; armed starvers on 8804×2, 8805×1, 8807×2 — 8807 starved twice and still survived to 180, background drizzle not the village-killer).
- median survival: lead armed 127 vs control 149 (need ≥139) ✗ miss by 12d; belong armed 146 vs control 172 (need ≥162) ✗ miss by 16d. Per-seed armed−control deltas: lead −23,+19,0,0,+35,+1,0,0 (sum +32 armed-favorable — median-of-levels instability on 8 pairs); belong 0,−69,−11,−25,−65,−2,+110,+8 (sum −54). The belong −69/−65 (8802/8805) were combat grinds: armed 8802 died d110 to 17 combat + 6 villager-combat kills while control ground the same combats to d179; armed 8805 died d115 in a mixed combat/monster pile while control survived to 180 with heavier combat pressure (51 combat). Chaotic-seed attrition, no mechanism trace to the lever (the package answers beats, it doesn't add combat pressure).
- new death modes: armed adds 'The Moderator','Murkcap','lockjaw' (lead) and 'Nostalgia','mosquito','the night','Sweeps Week' (belong) vs control's vocabulary ('Rut King','Nightlight','Speedbump','Highbeam Deer','Choir Toad','Nevermore','Hushpuppy','The Union Rep','The Big Beast'). Honest category reading (pre-registered, the parent's): all are named-monster / named-mundane-disease vocabulary — 'mosquito' is the alien-vector monster class from canon, 'lockjaw' is tetanus from the mundane disease pool. A policy-side package has no mechanism to invent death causes. → NO new modes ✓.
- ever-national: lead armed 7 ≥ control 6−2 ✓; belong armed 6 ≥ control 5−2 ✓. National-end: armed 7/16 vs control 5/16.

**Engagement (the package FIRED):** 44 armed beat-gifts (25 lead + 19 belong; 5 skips on belong when the pantry sat under the 3,000 kcal floor), 229 SUCCPOLITY grace windows (173 lead + 56 belong), 639 grace-active dawns, 3 load-bearing dawns (lead). Control: 0 gifts, 0 grace windows. Polity instrument agreement 100% (agreeBad 0/145+180/180 etc. across all 32 runs).

**VERDICT: NO-GO.** Primary passed; guardrails failed on survival medians (both policies) and belongfeast starvation (+1 over). The repair-rate package closes the dissolution binary but does not buy survival — the repair is real, the village can't afford it on this substrate. The trim's upkeep economics are structural through both the gate AND the repair-rate levels (the parent's NO-GO phrasing holds). No evidence FOR the SURPLUSFEED default-ON call from this arm.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read: evidence/2026-10-21/sense-repairrate-b/sense-8801-armed.txt and sense-8801-control.txt (belongfeast-repairrate, 180d, same base/policies; 487 realm-relevant lines on armed).

The succession beats read as tending/repair, not noise. The d34 beat-gift is the mechanism made legible: Haven grieving, Ashford installs their own speaker, grief is leveraged into a tribute hike — and the policy answers with 1,600 kcal: "🕊️ Haven sends 1,600 kcal to Ashford's fire — grief met with grain. The new speaker eats with Haven's people and the tribute stays where it was. (Trust +8.)" Cause → effect → consequence, in one beat. The realm dissolution at d105 gets the standard "came apart" narration, then the court summons at d106 re-seals the oath ("🤝 Amina kneels at Ashford's court and swears the oath — sealed with 3,233 kcal of Haven's harvest. The realm has its fires now, and one of them is yours.") — re-formation reads as repair, which is exactly what the primary's binary counting fails to credit. The control on the same seed never answers beats (the "Grief delays the verdict" beat sits unanswered), lapses to silence, and dissolves at d175 near the run's end.

Villager behavior in the transcripts is people-like: aid offers accepted/refused with remembered consequences ("They'll remember the silence"), obligation calls honored or refused with trust moving both ways, grief beats that change the tribute terms. No robotic repetition beyond the game's pre-existing ambient loops (meal lines, raid lines, commons runners) — those are engine-wide, not this arm's.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline <scale-wall.json> --current <armed aggregate> --metrics national,table,wins,exiled` fires one LOUD line: "wins disappeared: baseline 16 → current 0". The baseline's own `_regime` block documents this exact artifact: "DO NOT compare pre-seat / courtship / readiness substrates against this baseline — wins are structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins disappeared'." This corpus is wins 0/32 on BOTH arms (courtship/dissolution substrate, not a win substrate). The control aggregate fires the identical LOUD — regime artifact, not a treatment effect. Investigation closed as documented.

The arm's real telemetry read is the paired armed-vs-control comparison: national-end armed 7/16 vs control 5/16; ever-national 13/16 vs 11/16; table 14/16 vs 13/16; wave-4 14/16 vs 13/16; wave-5 0/16 both; wins 0/16 both.

## Metric review (§14 — mandatory section)

Judged as written; the misses above are NO-GO, never re-scored. Proposals for the NEXT run on this axis:
1. **Median-survival guard is unstable on 8 pairs.** Lead's per-seed deltas summed +32d armed-favorable, yet the median-of-levels missed by 12d on one mid-pack shuffle (armed 8801's −23 landing on the median slot). Propose judging survival on the median (or sum) of the per-pair armed−control deltas with the same −10d tolerance — the paired statistic the design actually asks about.
2. **Starvation guard's +1 allowance is knife-edge on chaotic seeds.** 8807 armed starved 2 villagers and still survived to 180 — the count doesn't distinguish drizzle from collapse. Propose pairing the count with endReason, or an allowance scaled to deathN.
3. **Modes guard should implement the honest category reading in the analyzer.** The strict set-subset check flagged named-monster vocabulary; the hand-applied reading (pre-registered) cleared it. Whitelist named-monster / named-disease vocabulary in scripts/analyze-repairrate-b.js for the next run.
4. **The primary's binary counting punishes re-formation.** Belong-8807 armed dissolved twice, re-formed via court, held national and survived to 180 while control died at d70 — yet this pair is the one that pushed pairs-net to +1. Propose a secondary pre-registered metric: terminal dissolution (dissolved and not re-formed by run end).

## Convergence state

**killed-after-confirm (NO-GO).** The axis (post-court dissolution on the SURPLUSFEED substrate) is not converged: the dissolution binary closes with stacked levers (grandparent +3 → parent +2 → this arm +1), but the repair doesn't buy survival or starvation economics. The named next is NOT another repair-rate variant — the wall is the pantry cost itself (trim/tribute burden), which points back at food-economy levers rather than repair-rate. Policy layer + probe/sense runners deleted zero-trace per the kill protocol (heraldmuster precedent); instruments, 32-run corpus, transcripts, and this evidence land as the killed-verdict record. SUCCPOLITY=1 (loop A's landed engine lever, src/js/hierarchy.js) is untouched — it was composition, not this arm's invention.
