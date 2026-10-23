# sim-defer4transfer — TRANSFER DIAG: does VETFORMATION=1 move the defer4 veterans bar? (run fleshout-20261023T2015Z, axis scale-onramp)

Worker tree sim-defer4-transfer. Arm 2 of the run claim (arm 1 = sim-overcourt-restage, sibling).
Claim: ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/lever-claims/fleshout-20261023T2015Z.json.
Canon: docs/CANON.md + docs/MONSTER-WAVES.md read first (wave 4 = The Mirror Draft;
defer4 bar = 1 living wave-3+ killer; defer5 = 2 living wave-4+ killers).
The layer scripts/policies/vetformation.js is ON MASTER (landed e7fc8824e) — DRIVEN, not
modified; its proof untouched.

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- **BINDING QUESTION:** the landed VETFORMATION=1 layer forms wave-4+ killers (10 vs 6
  distinct vids, GO on the 68805–68814 formation band). The defer4 gate's SOLE short bar
  on 5/5 bound census configs is veterans = 1 living wave-3+ killer, NEVER released
  (sim-defer4gate DIAG-GO 11/11). Does formation produce LIVING wave-3+ killers on the
  defer4-bound band and release the defer4 veterans bar?
- **SUBSTRATE (pinned BOTH arms):** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1. Control = AD.armedFor(base), VETFORMATION unset;
  formed = VF.formedFor(base), VETFORMATION=1. ONE DELTA ONLY.
- **SEEDS:** 65511–65522 (the defer4-bound census band — deliberate reuse; NEW
  policy×seed combo, formation never ran there) × {leadfeast, belongfeast} ×
  {control, formed} = 48 configs, 180d death-aware (dead villages stop, +10d tail max;
  never a fixed 200d).
- **DIAG-GO (binding):** ≥90% of configs where w5gates-lib attribute() binds defer4 get a
  NAMED veterans-bar attribution from exactly these channels:
  `formed-a-w3+-killer-and-lived` / `formed-and-died` / `never-formed-any-w3+-killer` /
  `formation-does-not-stage-below-wave-4`. A miss is insufficient-data, not a failure —
  this is a DIAG.
- **TRANSFER SIGNAL (the finding — reported, not judged):** configs with
  barRelease4.veterans released, formed vs control; defer4 binding counts formed vs
  control; wave-3+ killer formation counts formed vs control.
- **GUARDRAILS:** median survival paired diff ≥ −15d; starvation ≤ control+2; no new
  death kinds (≥2-event rule); wall block (national/table/wins, wave4/5, median
  survival) both arms.
- **INSTRUMENTS:** NEW namespace defer4transfer-* (sweep composer + analyzer reusing
  scripts/w5gates-lib.js attribute() UNMODIFIED + waveKillLog direct reads deduped on
  (d, mid, by, via, trick) per backlog #844; windowstay unmodified — daily trace via
  G5.dailyGateTrace only, DET-neutral per the lib's own gate). Per-seed JSONs written
  ONCE to evidence/2026-10-23/perseed-defer4transfer/<arm>/ with hash-after-write
  readback (the selective write-denial class is real — every write verified).
  Sweep outputs to the worktree evidence dir, NEVER /tmp.
- **SENSE:** on any formed config where a wave-3+ killer lives ≥14d post-kill, read the
  beats for meaning (SENSE-TESTING LAW) — never just counts.
- **§15:** panel judged inapplicable for policy-layer zero-src/js DIAG arms per the
  doorcensus precedent — the paired identical-seed sweep on unmodified instruments is
  the instrument, the ≥90% bar the judge.
- **METRIC REVIEW section mandatory** (below).

## Sweep

48/48 configs complete (12 seeds × {leadfeast, belongfeast} × {control, formed}),
180d death-aware, anchor bf84a84d14d4 on all 48 (no base drift). Determinism
verified (control s65511-lead re-run byte-identical on the judged fields).
Infra note: a sibling's /tmp cleanup wiped the sweep logs mid-run (the known
/tmp-wipe class) — the per-seed corpus was untouched (worktree evidence dir,
hash-after-write readback green on every write).

## Results

### DIAG-GO (binding): 2/2 named = 100% — PASS, on a collapsed denominator

Only TWO configs bind defer4 on current master — s65515-leadfeast on BOTH arms:

| cfg | short | r4vets | vetRelease | channel |
|---|---|---|---|---|
| control s65515-leadfeast | [armor,weapons,veterans] | 0 | null | never-formed-any-w3+-killer (zero wave-3+ kill events) |
| formed s65515-leadfeast | [armor,weapons,veterans] | 0 | null | never-formed-any-w3+-killer (zero wave-3+ kill events) |

The pair are DET-identical twins: both survived 180d, maxWave=3 (wave 4 NEVER
unlocked, w4Day=null), 22 wave-1-2 kills, zero wave-3+ kills, byte-identical
death rows. The VETFORMATION layer never fired — the formation window (wave-4
unlocked) was never live — so formed ≡ control here. A clean negative control
for the layer's env gating, and the channel taxonomy held with no gaps
(no `other-short-bar`, no `no-gate-vector`).

### TRANSFER SIGNAL (the finding — reported, not judged): NO TRANSFER

| signal | control | formed |
|---|---|---|
| barRelease4.veterans released | 21/24 | 21/24 |
| defer4 binding | 1/24 | 1/24 |
| distinct wave-3+ killer vids | 39 | 43 |
| wave-3+ kill events (deduped) | 65 | 67 |
| configs with ≥1 wave-3+ kill | 21/24 | 21/24 |

The veterans-bar release pattern is IDENTICAL between arms — the same 21
releasing configs, the same 3 non-releasing ones (s65512 ×2: died d31 at
w3rung before wave 3; s65515-lead: survived 180d at maxWave=3, never faced
wave-3+). Formation adds a few more distinct killers (+4 vids / +2 events over
24 configs) but does not move the bar release or the defer4 binding count.

Binding distribution (end of run):
- control: stand-raw 4, defer5 11, w3rung 2, plenty-cap 4, unlocked 2, defer4 1
- formed: stand-raw 7, w3rung 2, unlocked 1, defer5 10, plenty-cap 3, defer4 1

### The premise dissolved: the band is no longer defer4-bound on current master

Same seed band, same policy, same substrate, different anchor:
- defer4gate corpus control-leadfeast (older anchor): {defer5:7, stand-raw:2, w3rung:1, defer4:2}
- this corpus control-leadfeast (bf84a84d14d4): {defer5:9, w3rung:1, defer4:1, stand-raw:1}

Cleanest single-config drift evidence — control s65513-leadfeast: defer4gate
measured veterans NEVER released, binding defer4; this corpus measures
vetRelease=108 (2 distinct vids), binding defer5. Master moved between the
runs (journey-deepening r36+r37 etc.), and villages now form living wave-3+
killers on control too. The defer4 veterans bar is no longer the wall on this
band — defer5 (11/10) and stand-raw (4/7) dominate the bindings.

### GUARDRAILS: all PASS
- median survival paired diff: 0.0d (bar ≥ −15d)
- starvation: control 27, formed 25 (bar ≤ control+2)
- new death kinds (≥2-event rule): none

### WALL (both arms — the wall doesn't move)
- control: national 11/24, table 20/24, wins 0/24, wave4 21/24, wave5 2/24, medSurv 127.5d, max 181d
- formed: national 11/24, table 18/24, wins 0/24, wave4 21/24, wave5 1/24, medSurv 124.5d, max 181d

Doors opened: control 2 (s65515-belong, s65517-belong), formed 1 (s65513-belong)
— all three villages died within weeks of opening (village-lost).

## Sense verdict (SENSE-TESTING LAW) — the beats read as people

23 formed config-killers lived ≥14d post-kill. Two reads:

**s65513-belongfeast (formed) — formation succeeded, retention failed, on camera.**
d110 Sofia kills terms_of_service (w3) → the veterans bar releases. d115 Sofia
kills callback (w3). d117 Mateo kills congregation (w4, via=companion — the
formation channel). d125 Ruth kills buffering (w3). d134 Elif kills reunion
(w4, via=companion). Four blooded villagers; the defer4 bar released d110; the
wave-5 door OPENED (all gates met, peak-ratchet grandfathered). Then d148
ruth_goldstein (combat), d148 elif_demir (combat), d149 mateo_alvarez
(combat) — three veterans die in combat within two days; r4.veterans reads 0
at end; village-lost d159. The formation half did its job — the bar released,
the door opened — and attrition killed the veterans anyway. This sharpens the
vetformation named-next #1 (retention is now the binding half) and matches the
backlog's "door opened, village still died" pattern on a new seed.

**s65514-leadfeast (formed) — the defer4 veterans story as a success.**
d84 Martina kills focus_group (w3, via=wild — organic, not the formation
channel) → bar releases d85. d93 Ruth kills suburb (w4, via=companion),
d110 Ruth kills congregation (w4, via=companion) — the formation channel
forming Ruth. Martina lived 96d post-kill, alive at the d180 end; Ruth lived
74d (died d167). The defer4 bar released d85 and HELD: r4.veterans=2 at end,
r4 ready=true, binding=defer5. Martina was a blooded veteran for three months
of village life — the bar's question ("do you have even one blooded fighter
alive right now") answered yes, week after week.

VERDICT: PASS. The kill/death/bar beats compose into coherent people-shaped
stories — formed killers who live, hold the bar, and die in later combat; the
refuser/rescuer texture from the vetformation sense run carries through in the
via=companion channel.

## Blanks filled / documented

- FILLED (measured): the transfer question — NO transfer. Bar release 21/24
  both arms (identical pattern); defer4 binding 1/24 both arms (same config);
  formation adds +4 distinct wave-3+ vids / +2 events over 24 configs.
- DOCUMENTED (evidence, no design call): the defer4-bound band dissolved under
  base drift — 2/48 configs bind defer4 on current master vs 5/24 in the
  defer4gate corpus. The veterans bar releases on control now. The wall's
  binding segment moved: defer5 + stand-raw dominate; defer4 is no longer the
  wall on this band.
- DOCUMENTED (sensor): deathRow duplicate monster-death tele writes — 89
  duplicate rows (13 configs) control, 81 (13 configs) formed, symmetric
  across arms. Extends backlog #844's duplicate class from waveKillLog to
  deathRows. Verdict-neutral here (guardrails key on kinds; starvation clean),
  but any future arm counting death EVENTS must dedupe.
- DOCUMENTED: the s65515-leadfeast twin pair is a clean negative control —
  wave-4 never unlocked ⇒ formation window never live ⇒ formed ≡ control
  byte-identical. The layer's env gating holds.

## Metric review

- DIAG-GO 2/2 (100%) ≥ 90% → PASS as pre-registered. Honest caveat: the
  denominator collapsed from the expected ~5 to 2 under base drift, so the
  attribution table is thin; the transfer signal (reported, not judged) is the
  substantive deliverable and it is decisive (identical 21/24 releases).
- The `never-formed-any-w3+-killer` channel is exact on s65515-leadfeast:
  zero w3+ kills, maxWave=3 — the village never faced wave-3+ monsters. The
  channel taxonomy covered every defer4-binding config with no gaps.
- `formed-a-w3+-killer-and-lived` fired 0 times in the defer4-binding
  denominator but 23 times across formed configs generally (the sense flags) —
  the channel is real; it just isn't where the binding lives anymore.
- waveKillLog deduped on (d, mid, by, via, trick) per #844 in the analyzer;
  the distinct-vid counts are unaffected either way.
- No metric proved wrong; nothing re-scored. For the NEXT transfer DIAG on a
  band: pre-register a drift check — re-measure the band's binding distribution
  on the current anchor BEFORE assuming the corpus premise still holds.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-23/perseed-defer4transfer/<arm>/*.json'
--metrics national,table,wins,exiled` fired LOUD on both arms:
wins disappeared 16→0.

**Investigated — EXPLAINED, no bug, baseline NOT rolled.** The scale-wall.json
baseline's own `_regime.note` says: "DO NOT compare pre-seat / courtship /
readiness substrates against this baseline — wins are structurally ~0 there."
This corpus is SEATDRIVE=0 (non-seat substrate, deliberate — the table win
lands ~d90-134 and the run ENDS before villagers blood themselves); the
baseline is the winseat regime (SEATDRIVE=1). Same verdict as the vetformation
run on the identical substrate.

## Instruments committed (namespace defer4transfer)

- scripts/defer4transfer-sweep.js — the 48-config census composer
- scripts/defer4transfer-analyze.js — the judge
- evidence/2026-10-23/perseed-defer4transfer/{control,formed}/ — the corpus (48 files)
- evidence/2026-10-23/sim-defer4transfer.md — this file

## Convergence note

- Axis scale-onramp: the transfer DIAG closes the defer4gate named next
  ("formation is the lever" for the defer4 veterans bar) with a negative
  transfer on the named band — but the band itself moved. The defer4 veterans
  bar is no longer the wall segment here; defer5 (the 2-veteran coincidence)
  and stand-raw (dip+links zero, the diplomatic layer) are. Formation's value
  now reads through the retention half (vetformation named-next #1, the
  sibling's territory): s65513-belongfeast shows formation releasing the bar
  and opening the door, then losing the veterans to attritional combat.
- The scale wall stands (wins 0/48 both arms — structural on this substrate);
  the binding moved from defer4 to defer5/stand-raw on current master.
