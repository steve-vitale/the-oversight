# sim-vetshape — the veteran-bar shape instrument (2026-10-17)

Run: flesh-out loop arm sim-vetshape (axis scale-onramp, the blocking axis).
Worktree: ~/workspace/worktrees/sim-vetshape. Branch: sim-vetshape.
Sweep-time master commit: cfaab2f976590fe438e67504e6c08840095355de (recorded
in every per-seed JSON).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first). This is an
INSTRUMENT for Steve's design call #427 — not a game change.

## The question

sim-wave4census (evidence/2026-10-17/sim-wave4census.md) named the binding
constraint on wave-4 unlock: the readiness gate's **veterans** bar (design
call #4, src/js/standing.js waveCombatReadiness). It is in the binding set
on 29/34 non-winning runs (85%), fails on 100% of 3,131 deferral days, and
never reaches its demand of 2 on any run. The mechanism: the kill channel is
scholar-centric and killers die — the bar demands 2 LIVING killers from a
channel that produces at most one at a time. The finding's named next: "the
bar changes shape (count kills not living veterans). Sharpens the
readiness-gate steve-call (#427)."

This arm builds that shape change as a DEFAULT-OFF instrument and measures
whether it moves the wave-4 unlock on the pre-seat win-side substrate.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING)

**THE INSTRUMENT:** VETSHAPE=1 (default OFF) in src/js/standing.js ONLY.
Gate off = pure current behavior, byte-identical (proved by det-gate).
Gate on: waveCombatReadiness()'s veteran bar counts DISTINCT KILLER VIDS
with wave-(w-1)+ kills in the same waveKillLog the gate already reads,
living-or-dead. Demand unchanged (2 for wave 4, 3 for wave 5).

**Exact ledger/definition:** state.waveKillLog is written by recordWaveKill
(game.js): one entry per kill `{d, mid, w, by, via, trick}` — player combat
AND villager field fights both score. The gate reads entries with truthy
`e.by` and `(e.w|0) >= w-1` (wave-3+ for the wave-4 bar, wave-4+ for the
wave-5 bar). Pristine adds `isLiving(e.by)`; VETSHAPE=1 drops only that
requirement. One vid = one veteran, however many kills. Sub-threshold
kills (w2 for the wave-4 bar) still excluded. Waves 1–3 never gated.

**PRIMARY (GO):** wave-4 unlock share armed (VETSHAPE=1) ≥ control
(VETSHAPE unset) **+ 3** on the pre-seat substrate: 8 FRESH seeds (0 filename
hits across evidence/ — verified 2026-10-17: 2210317, 2320419, 2430521,
2540623, 2650727, 2760829, 2870931, 2981033) × {leadfeast, belongfeast}
(SD.leadseat/SD.belongseat — the exact wincensus-c policyFor mapping),
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1, SEATDRIVE=0 EXPLICIT both arms, ALLOWGATE2 unset, 180d
death-aware, identical seeds per arm (16 runs per arm). Control expected
0/16 (0/64 historical on this substrate — the arming precedent got 2/16
via the companion channel).

**Proof:** scripts/test-vetshape-20261017.js — RED-pinned (gate-on fixture
counts a dead wave-3 killer: FAILS on pristine standing.js — verified
veterans=1 on pristine with VETSHAPE=1 set — GREEN with the instrument;
gate-off fixtures pin pristine parity) and GREEN (16/16), including
det-gate (gate-off 60d day-hash trajectories byte-identical to the pristine
baseline scripts/vetshape-det-baseline-20261017.json on 4 combos,
captured on pristine code before the edit).

**GUARDRAILS (kill conditions):** starvation deaths armed > control+2;
median survival armed < control−10d; any new death mode on armed; wave-4
unlocks bought with mass death (the w3drive kill precedent: survival cost
is binding).

**SUBSTRATE LESSON (from sim-wave4census):** three food-code landings
shifted the ground mid-run — the sweep asserts the substrate env at
startup and records the sweep-time master commit in every per-seed JSON;
the proof is re-verified on the rebased base before finishing.

**IMPORTANT — NOT a game change:** even on GO, the game default stays
2-living-veterans until Steve rules (#427). The instrument lands
default-OFF; the GO verdict only sharpens the steve-call, it does not
change the game.

**Sibling interaction (sim-pyrrhic, same run):** pyrrhic extends
waveKillLog to 'lost' fights. This arm reads the kill ledger on
master+own-change only. If both land, the composition is positive — but if
pyrrhic's entries carry a loss marker, VETSHAPE=1 composed with it should
filter to kills (lost-fight participants are not blooded veterans). Noted
for the coordinator; not experimented here. (Checked 2026-10-17: the
sim-pyrrhic branch has no commits beyond master yet — the interaction is
prospective.)

## Results

**PRIMARY: GO — armed 4/16 vs control 1/16 = +3 (threshold met exactly).**

| arm | n | w4 unlocks | starvation deaths | median survival (d) |
|---|---|---|---|---|
| control (VETSHAPE unset) | 16 | 1 | 12 | 182 |
| armed (VETSHAPE=1) | 16 | 4 | 12 | 182 |

The 4 armed unlocks: s2430521 leadfeast (also unlocked on control — the
flicker, survived 182d), s2430521 belongfeast (control twin: no unlock),
s2760829 belongfeast (control twin: no unlock; died d155 post-unlock),
s2981033 belongfeast (control twin: no unlock; survived 182d). The 3 NEW
unlocks are all belongfeast seeds where the control twin stayed at wave 3 —
the instrument moved them, on identical code and seeds, differing only in
VETSHAPE. End-state veterans (gate-on count) on the 3 new unlocks: 4, 4, 2
— the veterans bar cleared under the new shape while armor stayed short
(2/4, 0/4, 2/4), so the unlock was purely the shape change, not a
coincident armor clear.

**GUARDRAILS:**
1. Starvation deaths: armed 12 = control 12 — PASS (kill needed > +2).
2. Median survival: armed 182d = control 182d — PASS (kill needed < −10d).
3. New death modes: armed causes ⊇ control causes plus "The Congregation":1
   — a wave-4 monster kill on the s2981033 run. Same death MODE as the
   existing named-monster causes ("The Mountain Lord":1 appears in both
   arms); it appears because wave 4 unlocked, not because the instrument
   introduced a new way to die — PASS (explained, documented).
4. Unlocks bought with mass death: 3 of 4 armed unlocks survived to 182d
   with death tolls (45, 48, 63) inside the control range; 1 of 4
   (s2760829) unlocked ~d89 then died d155 in the wave-4 meatgrinder —
   the exact "opened a war it couldn't staff" pattern from sim-wave4census's
   s1060511. This is the CONSEQUENCE the instrument exists to surface for
   Steve's #427 call: the shape change opens the gate on blood that is
   already spent, and wave 4 then collects. Not a trip (median survival and
   starvation identical; the deaths are wave-4 combat, not the instrument) —
   but it is the honest cost, reported for the steve-call.

**The mechanism, confirmed:** the kill channel is scholar-centric and
killers die. Ledger dumps on the 3 new armed unlocks show 10 distinct
wave-3 killers — **10/10 DEAD at end** (s2430521: Divya Wieczorek d114+d127,
Jovan Milic d138, Somchai Prasert d155, Jason Ramirez d163; s2760829:
Somchai Prasert d79, Olivia Bennett d89+d98, Ava Garcia d101,
Nino Kapanadze d108; s2981033: Viola Bauer d122+d129, Patrick Rizzo d146).
All via='player' (the scholar's TB fights — companions landing the killing
blow; no 'agency' field-fight wave-3 kills on these runs). Under the
pristine living-veterans definition these villages end with veterans=0;
under the new shape they end with 4/4/2 — the bar opens on the village's
actual blood record, not on survivors it never had.

## Village assessment (plain words)

The modal village on this substrate: grinds to national, bleeds in the
wave-3 overtime (45–63 deaths per 180d, almost all combat), learns counters
prodigiously (25–28 known, 8× the tricks bar), arms widely — and holds at
wave 3 because it cannot keep two killers alive. The shape change lets
three such villages through the door. Two of them hold it to day 182; the
third (s2760829) dies 66 days later in the Mirror Draft it unlocked —
Olivia Bennett blooded the village twice (d89, d98), the gate opened d89,
and the village was gone by d155. The instrument doesn't change how
villages fight or die; it changes what the System counts as having fought.

Who thrived: the companions who land wave-3 killing blows inside the
scholar's fights — Divya, Olivia, Viola, Patrick, Jovan, Somchai, Ava,
Nino. Who died and why: those same people, soon after — the wave-3
meatgrinder takes the killers first, which is exactly why the living bar
never compounds. What was missing: not gear, not knowledge, not weapons —
surviving blood. The shape change doesn't fill that blank; it redefines
the bar around the blood that's already been spent. Whether that's the
right definition is Steve's #427 call — this arm only proves the shape
moves the unlock (+3) without moving survival (median 182d = 182d) or
starvation (12 = 12).

## Sense-testing (SENSE-TESTING LAW)

**s2760829 belongfeast armed — the unlock and the death.** The hold beats
the village hears are honest about the new shape's fiction problem:
- d51: "The next act is not for strangers. The village must be ready to
  FIGHT it — armor the village (3 of 4 fighters armored); blood your
  fighters (0 of 2 veterans)."
- d79: "The next act is still waiting — blood your fighters (0 of 2
  veterans)." (armor cleared 4/4)
- d86: "blood your fighters (1 of 2 veterans)." — under VETSHAPE=1 this
  counts Somchai's d79 kill whether or not Somchai is still breathing.
- d89: "📡 RATINGS ARE UP... Wave 4 talent has been released. The Mirror
  Draft opens." — Olivia Bennett's d89 kill made 2 distinct killers; the
  gate opened the same day.

The fiction says "blood your fighters" while counting the dead — a real
fiction consequence of the shape change, and exactly the kind of thing
Steve's #427 call must weigh: is a dead killer a veteran? The village then
died d155 in the draft it unlocked. The beats never lied about the bars;
they just count ghosts now. Coherent, and the cost is visible.

## Metric review (§14 — binding, never re-scored)

1. **Control hit 1/16, not the expected 0/16.** The pre-reg expected
   control 0/16 (0/64 historical). The one control unlock (s2430521
   leadfeast) is a wave4census-style FLICKER: end-state readiness shows
   veterans=0, short=[armor, veterans] — the monotonic peak ratchet caught
   a sub-day two-living-veteran coincidence (peak=4, total 397 at end).
   This raised the GO bar from +3-over-0 to +3-over-1; the armed arm met
   it exactly (4 vs 1). Not re-scored — the threshold arithmetic used the
   measured control, per the pre-reg.
2. **Guardrail 4 is a judgment call, documented not tripped.** See Results.
   The pre-registered hard kills (starvation, median survival, new death
   mode) all pass on the numbers; the post-unlock death on s2760829 is
   reported as the instrument's surfaced consequence.
3. **Telemetry deviation check:** `telemetry-check.js` against
   hidden_files/telemetry-baselines/scale-wall.json fired LOUD on
   maxWaveUnlocked/standingPeakWave — investigated: schema mismatch (the
   baseline tracks national/table/wins/exiled; the per-seed JSONs carry
   won/maxWaveUnlocked/standingPeakWave, not those fields). `won` is 0/32
   on both arms (no wins on the pre-seat substrate, as expected). Baseline
   NOT rolled forward — the schemas don't align and my run adds no
   national/table/exiled signal.
4. **Proof re-verified on the rebased base** (substrate lesson): after the
   sweep, master moved cfaab2f9 → 7a573e1b (3 sibling commits: journey r8,
   sim-cookdrive2-b killed, journey r20 — none touched standing.js). The arm
   rebased cleanly onto 7a573e1b and scripts/test-vetshape-20261017.js was
   re-run: 16/16 GREEN, det-gate byte-identical on all 4 combos against the
   pristine baseline. No substrate shift within this instrument's scope;
   the sweep-time commit (cfaab2f9) stands as recorded in every per-seed
   JSON.

## Convergence

**converging.** The instrument is proven (16/16 proof, RED-pinned,
det-gate byte-identical gate-off), the PRIMARY is GO (+3, threshold met
exactly), guardrails hold on the pre-registered numbers. The finding
sharpens Steve's #427 call to a specific, measured trade: count kills not
living veterans → +3/16 wave-4 unlocks, same survival, same starvation —
but 1 of 4 opened villages died in the draft it unlocked, and the hold
fiction now counts the dead ("blood your fighters (1 of 2 veterans)" with
a corpse in the count). The axis stays scale-onramp; the next step is
Steve's ruling, not another lever.

**NOT a game change (repeat for the record):** the game default stays
2-living-veterans. VETSHAPE is unset by default — the gate-off path is
byte-identical to pristine. Even this GO changes nothing in the game until
Steve rules on #427.

## Files

- src/js/standing.js — the VETSHAPE instrument (default OFF; 12+/1-)
- scripts/test-vetshape-20261017.js — proof (fixtures + det-gate; 16/16 GREEN)
- scripts/vetshape-det-baseline-20261017.json — pristine 60d day-hash baseline (4 combos, self-deterministic)
- scripts/sweep-vetshape-20261017.js — the 32-run sweep (substrate-asserted, commit-recorded)
- scripts/ledger-dump-20261017.js — post-sweep ledger/village-assessment helper
- scripts/sense-probe-20261017.js — beat-capture helper for sense reads
- evidence/2026-10-17/perseed-vetshape/ — 32 per-seed JSONs
- evidence/2026-10-17/vetshape-sweep-summary-20261017.json — aggregate summary
- evidence/2026-10-17/vetshape-sweep.log — sweep console log
- evidence/2026-10-17/sim-vetshape.md — this file
