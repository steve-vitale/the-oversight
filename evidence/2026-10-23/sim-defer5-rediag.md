# sim-defer5-rediag — wave-5 defer5 coincidence-trap RE-DIAGNOSTIC (run fleshout-20261023T2217Z, axis scale-onramp)

Worker tree sim-defer5-rediag, DIAG arm: instrument-side, ZERO src/js changes.
Namespaces: defer5rediag-* (scripts + evidence/2026-10-23/perseed-defer5rediag/).
Disjoint from the sibling arm's namespace (trustbuffer-*) and from loop B
(feastdisc-*/homecoming-*/scholardist-*).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md ("Combat readiness
gates the standing unlock (design call #4, 2026-10-16)"; defer5 demand:
4 armored@P>=15, 6 armed, 3 counters, 2 LIVING wave-4+ killers —
recalibrated 2026-10-18).

## Why a re-DIAG

The original DIAG (evidence/2026-10-23/sim-defer5gate.md, now STALE) found
the defer5 coincidence trap: 16/16 defer5-bound configs had 0 days where
armor AND veterans were both met simultaneously; veterans was the universal
binder (16/16 short at end, only 1/16 ever had 2 living wave-4+ killers at
once); armor the co-binder; tricks never bound; weapons decayed, never
supplied. The follow-up (evidence/2026-10-23/sim-defer4transfer.md) found
the band moved under base drift: "defer5 (the 2-veteran coincidence) and
stand-raw (dip+links zero, the diplomatic layer) are [the wall segments]";
the defer4 veterans bar is no longer the wall on that band. Master moved
substantially since: armorvillage landed (the armor-economy drive —
communal armor pile, giftArmor), armored15 confirmed, vetformation landed.
Question: is the trap's SHAPE the same? Did the armor leg fill? Are
veterans still the universal binder?

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- **BINDING QUESTION:** Re-attribute the defer5 wave-5 coincidence trap on
  CURRENT master: which of the 4 bars binds most often NOW (bar-by-bar
  current binder ranking), what is the coincidence-overlap distribution
  (days all four bars simultaneously met), and did the trap's shape change
  vs the original DIAG (armor leg filled? veterans still universal binder?).
- **SUBSTRATE (pinned, identical across the sweep — confirmed from the
  defer5gate/defer4transfer evidence headers + ARMORVILLAGE=1, the current
  best armor substrate):**
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1; policy = armorvillage.armedFor
  (armorydrive pinned substrate + armor-economy drive). VETFORMATION,
  LINKFORM, FEASTDISC/HOMECOMING/SCHOLARDIST families unset (sibling
  namespaces untouched).
- **SEEDS (fresh — C1 freshness gate):** 70111–70122 × {leadfeast,
  belongfeast} = 24 configs, 180d death-aware (dead villages stop, +10d
  tail max; never a fixed 200d). Verified fresh: no s701*.json in any
  evidence/**/perseed-* corpus; the sweep refuses any seed in a banned
  block (68901–68912, 68501–68508, 68401–68408, 65511–65522, 65611–65618,
  65721–65729, 65801–65808, 66301–66316, 67501–67532, 67601–67608,
  67701–67708, 68301–68308, 68601–68608, 68805–68814, 92801–92816).
- **DIAG-GO (binding):** ≥90% of defer4/defer5-binding configs' bar
  outcomes attributed to the named channels (bar-met-then-lost / never-met
  / met-but-not-simultaneous / gate-released / overlap-before-standing),
  0 unexplained configs. A miss is DIAG-NO-GO, never re-scored.
- **GUARDRAILS:** wall block (national/table/wins, wave4/5, median
  survival); no new death kinds (≥2-event rule).
- **INSTRUMENTS:** scripts/w5gates-lib.js UNMODIFIED (dailyGateTrace +
  gateVector + attribute; the lib's DET gate pins instrument-on vs
  instrument-off byte-identical) + direct state.waveKillLog reads (dedup
  on (d,mid,by,via,trick) in the analyzer per backlog #844). Per-seed
  JSONs written ONCE to evidence/2026-10-23/perseed-defer5rediag/ with
  sha256-after-write readback (the selective write-denial class is real).
  Day-by-day bar tracking: the daily trace records all four r5 bars;
  the analyzer derives release days, peaks, coincidence overlap days,
  and the overlap-with-standing-live refinement (engine truth,
  standing.js:184-196: a coincidence day only releases the hold when
  capped>=200 the same day).
- **§15:** panel judged inapplicable for zero-src/js DIAG arms per the
  doorcensus precedent — the identical-seed corpus on unmodified
  instruments is the instrument, the ≥90% bar the judge.
- **METRIC REVIEW section mandatory** (below).

## Sweep (results below once complete)

24/24 configs complete (12 fresh seeds 70111–70122 × {leadfeast, belongfeast}),
180d death-aware, one anchor (a083fb04d3d0 — verified identical on all 24).
Per-seed JSONs in evidence/2026-10-23/perseed-defer5rediag/ with
sha256-after-write readback (all 24 green). 0 instrument errors.
Infra note: the background runner died silently at config 13 (no error, no
node process — the same silent-background-death class as the /tmp-wipe
family); the corpus was untouched (worktree evidence dir, hash-verified
writes) and the sweep resumed cleanly for the remaining 11 configs with
identical env. Determinism spot-check: the E2 proof gate (s70111-leadfeast
run twice, all judged fields byte-identical) passed.

## Attribution — PRE-REGISTERED DIAG-GO: 22/22 named, 0 unexplained → DIAG-GO

Analyzer: scripts/defer5rediag-analyze.js (w5gates-lib UNMODIFIED; sensors
recomputed from the stored daily trace with live demands as a cross-check;
end-binding recomputed from the final trace row — 0 mismatches after the
'unlocked' labeling fix).

- Denominator: 22 configs (12 gate-released mid-run-but-not-end-binding +
  10 end-binding defer5). Named: 22. Unexplained: 0. Exceeds the ≥90% bar.
- Channels:
  - `gate-released`: 12 — the defer4/defer5 hold fired mid-run but is not
    the end binding. Subs: door-opened ×1 (s70119-lead), binding-moved-to:
    stand-raw ×7 (the hold was live, then standing fell below 200),
    binding-moved-to:plenty-cap ×4 (bread-heavy standing, cap holds at
    t5-1).
  - `bar-never-met:veterans`: 9 — the defer5-binding configs where 2 living
    wave-4+ killers were NEVER fielded (veteran peaks 0–1 all run).
  - `met-but-not-simultaneous`: 1 (s70121-belong) — all four bars met at
    some point (armor peak 10 rel d70, armed 11 rel d1, tricks 26 rel d10,
    veterans 2 rel d151), 0 overlap days. The coincidence trap, live on
    current master.
- `overlap-before-standing`: 0 configs — no config coincided the bars
  while standing was short (and the engine forbids coincidence-with-
  standing-live while still binding, so this channel stays a guard).
- defer4 binds 0/24 at end — confirms the defer4transfer finding: the
  defer4 veterans bar is no longer the wall on current master.

## The current binder (bar-by-bar) — veterans is now the SOLE universal binder

Across the 10 defer5-binding configs, end-of-run short bars:

| bar | binds | never-met | met-then-lost |
|---|---|---|---|
| veterans (2 living w4+ killers) | **9/10** | **9** | 0 |
| armed (6) | 7/10 | 0 | 7 |
| armored (4 @P>=15) | 5/10 | 0 | 5 |
| tricks (3) | 0/10 | 0 | 0 |

The 10th config (s70121-belong) is the coincidence trap: veterans WAS met
(2 living killers d151) then lost, with 0 overlap days.

Shape change vs the original DIAG (sim-defer5gate, 16/16 defer5-bound):
- **The armor leg FILLED.** Original: 3/16 never fielded 4×P≥15 at once;
  armor the co-binder. Now: armor peaks 7–10 on ALL 10 binding configs,
  release days as early as d2 — armorvillage's economy drive works. Armor
  now binds only via decay (5/10, all met-then-lost: gear decay/breakage +
  deaths strip it back off).
- **Weapons leg filled the same way**: peaks 10–11, met from d1; 7/10
  bind only as met-then-lost (end-of-run snapshots still mislead on decay
  bars — the defer5gate instrument nuance holds).
- **Tricks still never bind** (15–26 counters; knowledge is free).
- **Veterans hardened from co-binder to sole universal binder**: original
  16/16 short, 1/16 ever fielding 2 living killers. Now 9/10 never-met
  (peaks 0–1 — the village never has 2 living wave-4+ killers at once)
  and the 10th met-then-lost-without-coincidence. Wave-4+ kills happen
  (12 events by 11 distinct vids across 24 configs) but killers don't
  survive in pairs: 9/10 binding configs never had 2 alive simultaneously.

## Coincidence overlap distribution

Days with all four r5 bars simultaneously met: **0 on 23/24 configs**;
16 days on 1/24 (s70119-lead, d103–118 — the door OPENED there, peak=5
grandfathered). The trap's headline number moved from 0/16 to 0/23 —
the coincidence is still essentially absent on current master.

## The one door-opening (SENSE read, s70119-lead)

d96: the scholar kills an Influencer (w4, via=player) — veterans 0→1.
d103: giulia_bianchi kills a Reunion (w4, via=companion — the formation
channel) — veterans 1→2, standing crosses 200 the same day (raw 237),
all four bars coincide (8/8/18/2) → the door OPENS, ratchet grandfathers.
d103–118: the village holds the door open (armor 7–8, armed 7–10).
d119: veterans 2→1 — a veteran dies in combat. d125: armored 7→1, armed
8→2, veterans 1→0 — mass combat deaths. d127: village-lost. Wave 5 was
unlocked 24 days and the village died before blood tested the Producers
— the retention trap in miniature, and the backlog's "door opened,
village still died" pattern on a new seed. The beat named only the
short bars throughout; no #734-class leak observed in this corpus.

## Sense review (adoption re-verification, 2026-10-23)

Re-read the s70119-lead trace off the corpus, not the prose. The retention-trap
narrative is a real reading of the trace, not count numerology — nothing
incoherent found:

- **Formation:** d96 the scholar (via=player) kills an Influencer (w4) →
  veterans 0→1, standing jumps 147→192 on war points. d103 giulia_bianchi
  kills a Reunion (w4, via=companion) → veterans 1→2 while standing crosses
  200 (raw 237) — two LIVING wave-4+ killers in the same window, one a
  villager. The door needed both, and both arrived by blood, not by the
  diplomacy/plenty lanes.
- **Coincidence:** d103 all four r5 bars met (armored 8/4, armed 8/6, tricks
  18/3, veterans 2/2) → ready=true; overlap window [103,118] = 16 days, and
  the analyzer's overlap print (first 103, 16 days) agrees with the raw
  trace day for day.
- **Door:** w5Day=103 recorded; config binding 'unlocked', sub 'door-opened'.
- **Loss:** d119 veterans 2→1 (one living killer stops counting — the bar
  counts only the living; this config's deaths are 23 combat + 11
  villager-combat, so a combat death is the honest reading, though death
  ROWS are not stored, which is the documented gap). d125 armored 7→1,
  armed 8→2, veterans 1→0 — gear and killers stripped by mass combat
  deaths in a single day. village-lost d127. Wave 5 unlocked 24 days
  before the village died; zero Producers faced.

The coherence confirms the instrument's shape-change story: the armor leg
is genuinely filled (this village held 7–8 armored for weeks), and what
killed it was the veterans leg it never held twice.

## Wall numbers (the wall doesn't move)

national 8/24, table 19/24, wins 0/24, wave4 18/24, wave5 1/24 (opened,
village-lost d127), median survival 151d, max 181d. Defer5 first-fire
days on the 10 binding configs: 58,69,85,103,117,122,135,143,166,167 —
median ~122 (vs d65 on the old corpus/old substrate; different seed
band, noted not claimed).

## Metric review

- The pre-registered DIAG-GO (≥90% named, 0 unexplained) was met at
  22/22 with 0 unexplained and 0 recompute mismatches. No metric revision:
  the bar worked as designed. One refinement for future runs, now in the
  analyzer's header: the reachable config channels for an end-binding
  defer4/defer5 are exactly {met-but-not-simultaneous,
  bar-never-met:<bars>, overlap-before-standing} — engine truth
  (standing.js:184-196) forbids coincidence-with-standing-live while the
  hold still binds, so that case is UNEXPLAINED by construction (E1-F
  pins it). The per-bar never-met/met-then-lost flavor lives in the
  `bars` map, which is where the shape-change story (armor 0 never-met
  vs veterans 9 never-met) is actually read.
- End-of-run snapshots still mislead on decay bars (armed 7/10 "short"
  at end, 10/10 met from d1) — the defer5gate instrument nuance
  confirmed again; the window-trace peak analysis is the honest
  instrument for retention bars.
- Guardrails: wall block reported above; death-cause shares —
  combat:544, villager combat:242, expedition:43, monster:40, sickness:17,
  starvation:17, 'a wound that wouldn't close':10, contest:9, ambush:7,
  dehydration:2, disease-beat kinds:2+1, alien:2, monster-name causes
  (Buffering/The Callback/The Big Beast/Inspiration):1 each,
  experiment:1. All 18 cause strings grep-verified present in src/js —
  **no new death kinds** (≥2-event rule). The defer4transfer-documented
  deathRow duplicate-tele class was not re-measured (this sweep stores
  death counts, not rows — the wave-4 killer autopsy named-next needs a
  death-row-carrying sweep; noted as a gap, not chased mid-DIAG).

## Blanks filled / documented

- FILLED (measured): the CURRENT shape of the defer5 coincidence trap —
  armor leg filled (armorvillage), veterans now the sole universal
  binder (9/10 never-met, 10th coincidence-trapped), overlap 0 on 23/24.
- DOCUMENTED (finding for sim-findings.md): the wall's binding segment
  is now defer5-veterans (capacity: villages never field 2 living wave-4+
  killers) + stand-raw/plenty-cap (7+4 gate-released configs fell back
  below the standing bar after the hold fired). defer4 binds 0/24.
- DOCUMENTED: s70119-lead is a complete door-opening specimen (d103 open,
  d127 village-lost) — the retention trap end-to-end in one trace.
- DOCUMENTED (gap): the wave-4 killer autopsy (what kills the veterans)
  needs death rows; this sweep's corpus carries only death counts.

## Convergence note

Axis scale-onramp. The re-DIAG closes the defer5gate named-next
("veterans-retention DIAG"): the armor side of the coincidence trap is
filled by armorvillage; the veterans side is now the entire wall —
villages blood wave-4 killers but never hold 2 LIVING ones at once, and
the one village that coincided everything died within 24 days of
opening the door. The retention half (vetformation named-next #1, the
sibling's territory) is confirmed as the binding half. Stand-raw
(dip+links zero, the diplomatic layer) and plenty-cap are the other two
live wall segments. The scale wall stands: wins 0/24.

## Instruments committed (namespace defer5rediag)

- scripts/defer5rediag-sweep.js — the 24-config census composer
- scripts/defer5rediag-analyze.js — the judge (classify() + report)
- scripts/test-defer5rediag.js — the proof (E1 synthetic channels, E2
  byte-identical determinism, E3 freshness gate, E4 w5gates-lib
  unmodified, E5 non-vacuous corpus attribution). Full run: E1 7/7, E2
  green, E4 green, E5 3/3; E3's corpus cross-check initially counted this
  run's own perseed-defer5rediag corpus (self-defeating) — fixed to
  exclude the own corpus and re-verified green (banned coverage true,
  fresh band passes, 0 prior-corpus hits).
- evidence/2026-10-23/perseed-defer5rediag/ — the corpus (24 files)
- evidence/2026-10-23/sim-defer5-rediag.md — this file
