# L887 PRE-REGISTRATION — Overtime-pacing attack on the tier-6 rerun grind
## (binding under MEASUREMENT.md §14; written before any sweep runs)

**Gap:** sim-findings.md line 887 — BREAK THE TIER-6 RERUN GRIND, NAMED NEXT
(postunlock2-b): "what breaks the tier-6 rerun grind while the table waits —
overtime pacing vs readiness bars vs table-sitting, aimed at the Eulogy
cascade and Editor+Rerun mechanisms."

**Why this arm, and why it is genuinely new:** the 1100Z run (coordinator
evidence ade6e54f2, all three arms NO-GO at pilot) armed two of L887's three
directions and measured the third's precondition away:
- table-sitting (sim-tablesit fa69e1262): trigger never fires — 0/8 national
  on plain competent, per-seed days identical. KILLED, policy deleted.
- readiness bars / door-deferral (sim-doorready e29eb6b04): 0 matched doors;
  the veteran bar (≥3 living wave-4+ killers) was never satisfiable (0 living
  wave-4 killers on all 72 window days in the only door window, seed 71903).
  KILLED, policy deleted.
- rerun census (sim-rerunclock e80742ee8): qualifying population empty —
  tier 0 on all 2,707 traced days, 0 rerun fights on pure competent.
  DIAG bar unmet; analyzer `diagGo` vacuously true on the empty population
  (overruled in evidence; the flag fix is a separate sim-findings line).
**Overtime pacing is the one L887 direction never armed.** This arm varies
only it. It does NOT re-stage rerunclock (no 180-day competent climb census),
tablesit (no post-national posture), or doorready (no margin-bar deferral).
It does NOT chase the doorready feast-cost hypothesis (n=1, post-divergence
RNG — a different question needing its own arm) and does NOT manufacture
veterans (the veteran bar stands as a separate named mechanism).

**Substrate precondition (the 1100Z methodological correction, binding):**
plain competent reaches 0 doors in 48 configs across the 1100Z run, so any
arm needing doors must pre-register against a door-reaching baseline. This
arm uses the **pinned wallseg substrate** (scripts/wallseg-sweep.js
checkEnv): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 KILLDISC=1
ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2
SEATDRIVE=0, REQUIRE0 list as in wallseg-sweep.js. Runner shape:
wallseg-sweep-style with scripts/postunlock-instrument.js
(postunlockDeaths / postunlockFights / waveKillLog / unlock), 180 days,
policies lead + belong (byte-identical on this substrate per postunlock2-b;
both are run so the claim does not lean on the identity).

**The lever (single, data-only, applied as a post-load override — no repo
data change):** armed configs override `Game.data.titans._overtime.daysPerTier`
7 → 14 after load (the exact manipulation proven in
scripts/test-overtime-pacing-l887.js: 12/12 green — cadence halves, cap
unchanged, per-tier punch and raid knobs unchanged). Control configs are the
identical substrate with no override. `maxTier` stays 6 in both arms: the
grind's end state is preserved, only its slope changes — doubling the window
to sit/prepare before each escalation step. A cap variant (6 → 4) is a
separate follow-up pre-registration, NOT part of this pilot (one lever).

**Pilot population (pre-registered):** the 8 known door-reaching wallseg
configs — seeds 70201, 70202, 70204, 70209 × lead/belong (the postunlock
re-sweep set; doors by construction, so the trigger population is non-empty
by design — the exact failure mode of all three 1100Z arms).
**Confirm population (only if pilot GOes):** full wallseg band 70201–70212 ×
lead/belong (24 configs), same bars.

**PRIMARY (binding — a miss is NO-GO, never re-scored):**
post-door survival days (door-open day → village-lost day, or 180d cap):
armed median ≥ control median + 20d **AND** seats-taken (armed) ≥ seats-taken
(control). The +20d shape reuses doorready's bar deliberately so the two
post-door arms are comparable.
**Guardrails (all binding):** wins (armed) ≥ wins (control); national rate
not lower; table reach not lower. A win/table gain that rides a survival
loss is still NO-GO.
**Secondaries (reported, not judged):** tier at death / tier at seat;
Eulogy-cascade deaths (cause-attributed via the gap-W2 attribution instrument,
commit 141126b07 — the postunlock2-b attribution gap fix, which is what makes
this primary's death-cause split measurable); veteran counts at door
(reported so the veteran-bar finding stays visible, not re-litigated).

**Kill rule:** pilot NO-GO → the arm is deleted per kill protocol (the
override lives only in the arm branch; nothing lands in titans.json or
src/js). A GO pilot does NOT land a data change: a titans.json
`daysPerTier` change is a balance lever that lands only through the
coordinator after the confirm run.

**Metric review (for the NEXT run, not re-scored here):**
1. Pacing moves more than the tier clock: raid knobs (cooldown/skip/gorge)
   and the seat-price penalty are per-tier, so fewer tiers by day X also
   means easier raids and a cheaper seat on the calendar. Report
   tier-at-event alongside endpoints; do not attribute a survival gain to
   "the clock" alone.
2. The 1100Z telemetry-regime note stands: do NOT compare this arm against
   the winseat telemetry baseline (SEATDRIVE=1 stack, national 12/16, table
   16/16) — compare armed vs control inside this run only.
3. If the pilot population's doors do not reproduce on the current master
   (wallseg configs were pinned to an older master), the arm is UNTESTABLE,
   not NO-GO — re-pin the substrate first, do not re-score the bar.

**Status:** PRE-REGISTERED ONLY. No sweep has been run under this
registration (the worker's brief forbids running an unregistered arm, and
this registration is the registration — the sweep itself is scheduled work
for the coordinator, not run here). Proof of the IV manipulation:
`node scripts/test-overtime-pacing-l887.js` (12/12 green).
