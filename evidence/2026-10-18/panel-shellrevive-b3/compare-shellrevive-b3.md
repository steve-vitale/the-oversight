# sim-shellrevive-b3 — before/after compare (pilot, original seeds 7001–7008 x 2 policies x control/armed, frozen base 01fd8945)

**Decision: NO-GO** (pre-registered step-3/step-4 adjudication)

Paired cases: 16. Light panels: control.json / armed.json in this directory.
Pre-registered metrics judged directly (see evidence/2026-10-18/sim-shellrevive-b3.md).

## Step 3 — harm-signal reproduction
- Pooled starvation: armed **2** vs control **2** (harm-class = armed > control+2 = 4). **not reproduced**

## Step 4 — revised-guardrail GO
- (a) engagement: armed shelled kcal **16830** (GO >= 30000), control **0** (GO = 0). **MISS**
- (b) starvation: armed **2** <= control+2 = 4. **HOLD**
- (c) pantry-draw displacement (control − armed, scholar): **-25664** kcal, nulls=0 (GO >= 0). **MISS**
- (d) national **10/16** vs control **10/16** (GO >= control−2). **HOLD**
- (d) median survival **102d** vs control **125d** (GO >= control−10d). **MISS**
- (d) new death modes: alien, a wound that wouldn't close. **MISS**
- (d) det-gate: scripts/test-shelltask-b.js Part C (byte-identical gate-off).

**Overall: NO-GO — kill zero-trace**
