# sim-deferraldisc — deferral-window discipline (flesh-out loop ARM, 2026-10-15)

Run: fleshout (arm: sim-deferraldisc).
Claims: sim-findings #310 (deferral-window discipline — policy side).
Axis: scale-onramp (standing scale directive; the win side of the wall).
Canon: docs/CANON.md + docs/TABLE.md (sanctity suspends MONSTER pressure but
NOT disease/starvation/wounds — the lame-duck window's exposure).

## Pre-registration (MEASUREMENT §§9–12, 14 — binding; a miss is NO-GO)

**Question:** #310 observed belongfeast s22 defer at the win-day floor (d60)
and the village DIE d85 before the d90 re-offer ('deferred-died'). The
winpursuit drain answers the table offer the dawn it appears; when the path
resolves pre-floor, the engine's winDayFloorDefer opens a waiting window of
(90 − day) days. Sanctity holds (monsters suspended) but disease,
starvation and wounds do not stop. The steve-call part of #310 (should the
engine protect the waiting period) is NOT this arm — no src/js changes.
This arm works WITHIN existing mechanics: WHEN to defer.

**Instrument:** scripts/policies/windefer.js (WINDEFER=1, default OFF,
zero src/js). Wraps the winpursuit drain and intercepts ONLY the
walk-now-vs-defer decision at the 7-door offer: at the offer, estimate the
waiting window's lethality from current village state (disease load via
village.sick daysLeft, wounded roster via village.health[vid] < 75,
pantry fresh-days via Game.pantryFreshDays() vs the window length, scholar
status via scholar.health / scholar sick) and DEFER (hold the offer
unanswered until the floor) ONLY when the window is plausibly survivable;
otherwise WALK NOW (drain immediately). Never re-picks doors (sibling arm
owns path selection — non-overlapping discipline). Never stalls
mid-challenge (hold applies only to the unanswered 7-door offer, all
option ids 'path:'); day ≥ 90 never holds.

- PRIMARY (binding): deferred-died verdicts armed <= control on identical
  seeds (fewer lame-duck deaths).
- CO-PRIMARY (binding): wins armed >= control (discipline must not cost wins).
- GUARDRAILS: median survival >= control−10d; national >= control−2/16;
  no new death mode (n>=3).
- Substrate: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast} ×
  {control, armed}, 180d death-aware, identical seeds both sides, own
  control in the SAME sweep (#247 — never inherit a baseline). WINTRAZE=1
  both sides (attribution on both; instrument proven behavior-neutral).
  Env flags FEASTSCALE_R13=1, WINPURSUIT=1 asserted up front in proof AND
  sweep (fail loudly if missing — #312 lesson); WINDEFER=1 armed-side only.
- Horizon: 180d death-aware. The win-day floor is day 90 and the deferred
  re-offer needs the days after; a shorter horizon would cut the chain.
- Proof: scripts/test-windefer-20261015.js (19/19 GREEN: REAL-RED on
  gate-off byte-identity + the decision RED; synthetic walks for every
  hold/walk branch incl. mid-challenge and downgrade modals; gate-off
  purity + SMOKE policy-id honesty + a real 70d run with the decision log
  asserted).
- Det-gate: scripts/det-gate-windefer-20261015.js — 16/16 identical
  (traced+deferred) required before the sweep.
- Honesty: the sweep records day-hashes; the verdict hard-fails if any
  armed run with ZERO holds diverges from its control — the hold is the
  layer's only legitimate delta.

## Metric review

No revision needed. All pre-registered metrics fired and were measured —
none was re-scored. One structural note (not a revision): on the
pre-registered substrate the layer fired ZERO holds, so PRIMARY and
CO-PRIMARY read as equalities (1≤1, 7≥7) rather than improvements. The
honesty gate (zero-hold armed runs byte-identical to control, 16/16) is
what makes the equality meaningful instead of vacuous: the instrument was
proven to change nothing except via holds, and no holds fired. A
supplementary 24-run scan on fresh seeds then demonstrated the hold path
executing as designed in the wild (9 natural holds, 2 hold→walk→win
chains) — reported below, not scored.

## Results — pilot sweep

Substrate: 8 seeds × {leadfeast, belongfeast} × {control, armed}, 180d
death-aware, FEASTSCALE_R13=1 + WINPURSUIT=1 both sides (+WINDEFER=1
armed), WINTRAZE=1 both sides, identical seeds, own control in the same
sweep. Proof scripts/test-windefer-20261015.js 19/19 GREEN. Det-gate
scripts/det-gate-windefer-20261015.js 16/16 identical (traced+deferred).
SMOKE gate green (policy ids + layer-live markers asserted per run).

**Pre-registered verdict: GO on every line (as equalities).**

| metric | armed /16 | control /16 | bar | verdict |
|---|---|---|---|---|
| deferred-died | 1 | 1 | armed ≤ control | GO |
| wins | 7 | 7 | armed ≥ control | GO |
| national | 5 | 5 | ≥ control−2 | GO |
| median survival | 90d | 90d | ≥ control−10d | GO |
| new death mode (n≥3) | none | — | none | GO |
| honesty: zero-hold armed == control | 16/16 byte-identical | — | hard | GO |

Holds fired on the pilot substrate: **0 of 32 runs.** Every pre-floor
offer failed the survivability bar, and the estimator's reads show it was
not close:

| run | offer day | sick | wounded | pantry | window | decision |
|---|---|---|---|---|---|---|
| belongfeast s22 | d60 | 0 | 3 | 0.3d | 30d | walk-now → deferred, died d85 |
| belongfeast s55 | d42 | 1 | 1 | 9.2d | 48d | walk-now → defer→re-offer → WIN d90 |
| belongfeast s66 | d43 | 0 | 2 | 8.0d | 47d | walk-now → defer→re-offer → WIN d90 |
| leadfeast s22 | d47 | 0 | 3 | 19.5d | 43d | walk-now → defer→re-offer → WIN d90 |
| leadfeast s44 | d76 | 1 | 2 | 2.3d | 14d | walk-now → defer→re-offer → WIN d90 |
| leadfeast s66 | d63 | 0 | 1 | 11.6d | 27d | walk-now → defer→re-offer → WIN d90 |

(Two more offers arrived post-floor — d90/d145 — and walked per the
floor-met rule.)

The honest headline: **on the courtship-road substrate, no offer-time
village meets the survivability bar — the bar is not miscalibrated, the
villages are lean and battered.** Pantries of 0.3–19.5 days against
14–48-day windows, wounded/sick everywhere. The #310 motivating case
(belongfeast s22) re-ran under the layer: the disciplined choice was
walk-now (pantry 0.3d < 30d window, 3 wounded) — identical to control —
and the village starved d85 both sides. The estimator was right; there
was no policy-side move.

Note what the table says about the deferral itself: 5 of the 6 walk-now
villages WON via the defer→re-offer path. The lame-duck window is
dangerous but it is also where the wins come from — the layer's
discipline (hold only when survivable) never obstructed a win.

## Supplementary: natural holds in the wild

scripts/scan-windefer-holds-20261015.js — armed side only, 12 fresh seeds
× {leadfeast, belongfeast}, 180d. NOT a re-score; validation that the
hold path executes as designed on real runs.

**9 natural holds across 24 runs**, including 2 complete hold→walk→win
chains:

- **belongfeast s2**: offer d81, held d81–d82 (sick=0, wounded=0,
  pantry 12.7d/9.8d vs window 9d/8d — "window plausibly survivable").
  d83 the pantry crashed to 4.3d < 7d window with a wounded villager →
  flipped to walk-now. Walked the door d83 → challenge → deferral →
  re-offer → **WIN d90**.
- **leadfeast s10**: offer d69, held d69–d75 (pantry 80–142d vs window
  15–21d, ≤1 wounded, scholar healthy). d76 a villager fell sick →
  flipped to walk-now. Walked d76 → **WIN d90**.

The daily re-evaluation is the discipline working: hold while the wait is
survivable, walk the moment it isn't — and in both cases the village won.
The hold path is proven end-to-end in the wild, not just on stubs.

## Sense-testing

Three reads (transcripts in evidence/2026-10-15/windefer-beats/):

1. **belongfeast-armed s22, the lame-duck death (deferred-died).** The
   table sits d60 ("A lesser seat — regional standing, waves 1–3 faced
   13/8/3, 6 contests survived, 4 crises weathered"), defers ("Ninety
   days. We do not price a life half-lived."), and the village starves
   through the window — "⚠ STARVING: health and energy falling" beats
   from d62 on, dead d85. The estimator's walk-now (pantry 0.3d vs 30d
   window) was the disciplined call and the village died exactly as
   predicted. Coherent, and it reads as tragedy, not a bug: the village
   was already in a starvation spiral at the offer.
2. **leadfeast-armed s44, the window survived (WIN).** Deferral at d76;
   the 14-day window reads as living people — a feast ("somebody laughs
   so hard they cry"), gossip by the fire ("the details have shifted.
   Nobody seems to mind"), the Herald circling the feast-smoke, Divya
   fetching water. Won d90. The window as lived time, not a loading
   screen.
3. **leadfeast-armed s22, walk-now → defer → re-offer → WIN.** The drain
   walked the feared door d47 (the layer's disciplined walk-now: 3
   wounded, pantry 19.5d < 43d window), the challenge played ("Show
   mercy" — "the audience weeps, and the galaxy learns that the feared
   one chose gentleness"), the table deferred, "WORD TRAVELS — riders
   from Thornfield bring talk of Haven," won d90. Decision, deferral,
   and win read as one story.

Capture limitation (inherited from sim-wintrace): the say-capture keys
on tableActive(), which stays true through the deferral window — the
beat cap fills with mundane lines before the d90 re-offer walk on long
windows.

## Wall numbers

Pilot sweep, per side (16 runs each — identical both sides):

- national: 5/16 | table: 8/16 | wins: 7/16 | deferred-died: 1/16
- wave 4–5 unlocks: 8/16 | median survival: 90d | max: 145d | exiled: 1/16
- All 7 wins walked the feared door (the drain's options[0]; path
  selection is the sibling arm's lever, untouched here).

The scale wall stands: national 5/16 on leadfeast only, belongfeast 0/8
both sides, wins only via the table road, wave 4–5 unlocks without
national. The deferral discipline moves none of these on this substrate
— it was never engaged here.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-10-15/perseed-windefer/*.json' --metrics national,table,wins,exiled`:
**quiet** — 32 files, 4 metrics, no large deviations, no LOUD lines.
Baseline NOT rolled forward (stale aggregate from a different substrate
era; policy-experiment convention per sim-wintrace).

## Findings filed

- #310 (policy side): EXHAUSTED on this substrate. The walk-now-vs-defer
  discipline is built, proven (19/19 proof, 16/16 det-gate, 16/16
  zero-hold byte-identity, 9 natural holds incl. 2 hold→walk→win chains),
  and filed as the instrument (scripts/policies/windefer.js, default
  OFF). On the courtship-road substrate it never engages: no offer-time
  village meets the survivability bar, and the motivating case's walk-now
  was the disciplined choice. **There is no policy-side answer to the
  lame-duck window here** — the villages that defer are exactly the ones
  that can't survive the wait. The remaining question is the steve-call
  engine half of #310: should the waiting period carry protection?
- New: the hold's daily re-evaluation flips walk-ward on pantry crashes
  and new sickness (observed twice in the wild) — the discipline is
  "defer only WHILE survivable," not "defer once, coast." Documented in
  the layer header.
