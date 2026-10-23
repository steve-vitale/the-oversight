# sim-w5door-b — wave-5 DOOR-OPENERS census on CURRENT master (run fleshout-20261023T0515Z, axis scale-onramp)

Worker tree sim-w5door-b, arm 2 of run fleshout-20261023T0515Z. DIAG arm:
instrument-side, ZERO src/js. Namespace w5door-b (disjoint from sibling
arms armorvillage and havendraw).

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- **BINDING QUESTION:** How does the wave-5 door open on current master?
  The prior census (sim-wave5door-openers, anchor 7f6f02487, VGEAR/leadfeast
  substrate) measured 1/12 doors, live-demand, post-win (s65423 d109), with
  the known-unlocker s65428 dead (stale-base finding #793). Since then the
  substrate moved: the splitclose corpus (0120Z review) shows control
  opening 4/16 doors on the armorydrive substrate, SEATDRIVE=0. This census
  re-answers the question on the richest measured door substrate (armorydrive,
  paired control/armed) at the current master anchor.
- **DIAG-GO (binding):** a mechanism table delivered — for every unlocking
  run the door-open attributed with 0 unexplained via w5gates-lib
  UNMODIFIED + release-path classification (live-demand vs grandfathered)
  via the PURE classifier; for every locked run the binding gate named via
  the lib; per-seed measured conditions at unlock (veterans bar fill day,
  armor state, w4 unlock day, w4-faced day, standing release day, bar-release
  days); plus named nexts. DIAG-GO = table at >=80% of runs fully
  attributed (0 unexplained) + named nexts. A miss is NO-GO, never
  re-scored.
- **If ZERO seeds unlock → DIAG insufficient-data (report-only, NOT a
  failure** — this is a DIAG arm; same rule as the prior census).
- **Seeds:** fresh pool 65511–65518 × {control, armorydrive} pilot (16
  configs). Confirm extension to 65511–65522 × {control, armorydrive} (24
  configs) iff ≥1 door OR ≥1 window (vetsMax≥2) opens in the pilot.
  Freshness verified per brief (filename scan + word-boundary value grep —
  see "Seed verification" below).
- **Substrate (EXACT armorydrive pinned substrate, FAIL LOUD):**
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1; ARMORYDRIVE=1 on armed configs, UNSET on control. Base policy
  leadfeast only (the prior w5door census base). Deviation from the task
  brief's env: NONE. POSTWIN is deliberately NOT set — SEATDRIVE=0 makes
  wins structurally 0, matching the splitclose reference corpus (6/32
  doors without postwin continuation).
- **Horizon:** 180d, death-aware (dead villages stop; +10d tail max).
- **Anchor:** 358a737d0bff7930 — recorded per-seed as anchorCommit; re-verify
  post-rebase before landing; re-run if the base moved (finding #793).
- **Instruments (all UNMODIFIED, all landed on master):** killdisc v2
  (scripts/killdisc-instrument-20261021.js) + windowstay window layer
  (scripts/instr-windowstay-20261021.js) + w5gates-lib
  (scripts/w5gates-lib.js) + release-path classifier
  (scripts/wave5door-openers-classify-20261022.js, PURE) + channel split
  (scripts/windowreach-r4-channels-20261022.js). My sweep composes them
  under namespace w5door-b.
- **Wall block (§15-adjacent, instrument-neutral):** win rate,
  vesting/national reach, table reach, Arc reach, wave reach (1–5),
  four-realm formation, median/max survival, death-cause shares, trap
  acquisition by source, counter discovery/counter-kill rate, young-link
  succession survival, tier-2 and wave-3 reach — recorded where state
  exposes them; the core wall set (national / table / wins, wave 4–5
  unlocks, median survival) is binding.
- **Sense:** transcripts of unlock beats on unlocking seeds
  (scripts/sense-w5door-b.js, AD substrate, narration on) — do they read
  as earned?

## Seed verification (recorded per brief)

The brief's candidate pool 65511–65526 was VERIFIED, not assumed:
- Filename scan: 0 filename hits across evidence/ + scripts/ for all 16
  seeds — the pool is FRESH.
- rg -w value scan: 0–6 word-boundary hits per seed — all investigated as
  numeric collisions in JSON telemetry values (e.g. "pantryFreshBefore":
  65526-style kcal figures in sibling corpora); targeted check for
  consumed-run seed keys ("seed": 6552x) and s6552x.json filenames:
  0 hits. The pool is FRESH; pilot consumes 65511–65518, confirm pool
  (if extended) 65519–65522.

## Proof

scripts/test-w5door-b.js — proof gates (GREEN before the sweep):
- E1 determinism: instrument-on vs instrument-off byte-identical day-hash
  sequences, 40d, one pilot seed.
- E2 env-gate: checkEnv() rejects wrong substrates (exit 2).
- E3 RED→GREEN: analyzer census functions on synthetic per-seed fixtures
  (unlocking live-demand + locked binding-gate) — attributed, 0
  unexplained.
- E4 anchor: the sweep's per-seed JSON records git HEAD at sweep time.

## Sweep

scripts/diag-w5door-b.js (ARM=control|armorydrive, SEEDS=, 180d) — the
oneRun pattern of the 10-22 census (AD policy, window trace, death rows,
engagements/kills/titans, w5gates-lib, wall numbers), minus the postwin
hook (SEATDRIVE=0, dead code without wins). Per-seed JSONs ONCE, on
purpose, to evidence/2026-10-23/perseed-w5door-b/{control,armorydrive}/.

## Results

[pending]

## Wall numbers

[pending]

## Village assessment

[pending — the unlocking run(s)]

## Sense test (SENSE-TESTING LAW — meaning, not counts)

[pending — transcripts of unlock beats]

## Metric review

[pending]

## Blanks filled / documented

[pending]

## Convergence note

Axis scale-onramp. This arm re-answers "how the door opens" on current
master at the 358a737d0bff7930 anchor, paired control/armed on the richest
measured door substrate.

## Results (pilot + confirm complete — 24/24 configs, anchor f5f19667ce19, completed by run fleshout-20261023T0713Z)

The dead 0515Z run's worker died with 13/16 pilot configs on a stale anchor (358a737d0). The adopting run reset the tree to current master f5f19667c, archived the stale JSONs (evidence/2026-10-23/perseed-w5door-b-anchor-358a737d0/), and re-ran the full pilot cleanly (seeds 65511–65518 × {control, armorydrive}, 16 configs). Pilot: 0/16 doors, but 1/16 windows (s65517 armorydrive, r5.veterans=2) → the pre-registered confirm extension triggered (≥1 door OR ≥1 window). Confirm: seeds 65519–65522 × {control, armorydrive} (8 configs). All 24 JSONs record anchorCommit f5f19667ce19.

**Verdict: DIAG insufficient-data (report-only, NOT a failure)** — 0/24 doors opened on current master on the richest measured door substrate. Binding gates all named via w5gates-lib (UNMODIFIED), 0 unexplained, 0 instrument errors:

- control (n=12): doors 0/12 — bindings {defer5:6, w3rung:1, plenty-cap:2, stand-raw:2, defer4:1}
- armorydrive (n=12): doors 0/12 — bindings {defer5:10, w3rung:1, stand-raw:1}
- combined: bindings {defer5:16, w3rung:2, plenty-cap:2, stand-raw:3, defer4:1}

**The defer5 gate is the binding constraint** (16/24). Contrast with the 0120Z splitclose corpus (control opened 4/16 doors on this substrate) and the 10-22 census (1/12): the door has shut on these seeds. Seed-set luck vs master drift is not separable here (different seed sets), but the mechanism is named, not mysterious — the readiness deferral holds.

**The one window tells the story** (s65517 armorydrive): the veterans bar filled 2/2 on days 114–123, and the door stayed shut because the wave-5 readiness read `short:["armor"]` every one of those days — the armor leg (4 fighters at worn P≥15) never filled. This census composes directly with the sibling arm sim-armorvillage-b (the #646 BUILD arm): the census proves the armor leg is what binds the door on the window; the build arm builds the structure to clear it.

### Wall numbers (this corpus, n=24)
national 12/24, table 15/24, wins 0/24, wave4 20/24, wave5 0/24, median survival 155d, max 181d. Death causes: combat 667, villager combat 193, monster 46, expedition 25, starvation 17.

### Village assessment
The villages that reach the door's neighborhood look the same as the 0120Z corpus: national reached (12/24), the table sat (15/24), wave 4 unlocked (20/24) — but the wave-5 door doesn't open. The defer5 binding means villages are *ready-adjacent*: the bars, not the deeds, are short. The armor short on the one open window is the actionable edge.

### Sense test (SENSE-TESTING LAW)
No unlock beats exist to read (0/24). The window-trace read of s65517 d114–123 is the sense datum: two veterans stand ready for ten days while the readiness board reads short on armor — the door doesn't creak, doesn't warn, doesn't negotiate. The System's silence here is the design question the defer5 gate poses: a village can see the door (the readiness bars are visible) but gets no beat for knocking. Flagged as a blank: the near-miss has no fiction.

### Metric review
The pre-registered DIAG-GO required a mechanism table of door-OPENERS at ≥80% attribution + named nexts. With 0/24 unlocks the opener table is structurally empty — the pre-reg's own insufficient-data clause applies (report-only). No metric revision: the clause worked as designed. Named nexts: (1) the armorvillage BUILD arm (live, same run) is the direct answer to the armor-short window; (2) a defer5-gate DIAG — what exactly the deferral demands on the window (bar-by-bar), and whether the demand is reachable by play vs only by structure; (3) re-run this census on the post-armorvillage master to see if the door moves.

### Blanks filled / documented
- Documented: the stale-anchor 13-config partial (archived, not mixed into the corpus).
- Documented: the near-miss fiction blank (no beat for knocking on a shut door).

### Proof
scripts/test-w5door-b.js — run on the current tree by the adopting run: **16/17**. The single miss is E5 (seed-freshness filename scan), a re-verification artifact: E5 can only pass pre-sweep — post-sweep the seeds trivially hit this arm's own per-seed JSONs. Freshness was verified pre-sweep per the brief (evidence "Seed verification" §: 0 filename hits across evidence/ + scripts/ for the 65511–65526 pool, word-boundary value scan investigated). E1–E4 all pass (env gates, RED→GREEN analyzer fixtures, anchor == HEAD at module load, determinism byte-identical, 0 instrumentErrors).

### Convergence note
Axis scale-onramp. The wave-5 door stands shut on current master (0/24) with the defer5 gate named as the binding constraint and the armor leg proven as the window's short bar. The armorvillage BUILD arm is the live answer.
