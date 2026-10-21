# sim-nowinwindow — no-win-policy post-invitation window census (arm sim-nowinwindow, DIAG, instrument-only)

Run: flesh-out loop, axis scale-onramp. Arm: sim-nowinwindow (DIAG-GO candidate).
Backlog #748's named next (from sim-windowreach-r3, DIAG-insufficient-data):
the no-win-policy variant — the only honest route to a true post-unlock
window census.

**The problem this arm answers** (sim-windowreach-r3, run fleshout-20261021T1615Z):
the wave-5 door is a lagging indicator of wins — 4 measured unlocks on the
VGEAR=1 winning substrate, all won through the window without fighting
wave-5. The win truncates every measurement at ~d90-130. The r3 arm proved
the harness cannot continue post-win within the DIAG read-only constraint
(runDays stops at Game.over; clearing it would be a game-state write). So:
reach the door, refuse the seat, and let the post-invitation window run to
the 180d horizon.

**The layer** (scripts/policies/nowinwindow.js, NEW — zero src/js changes):
wraps the vgearconfirm winning stack OUTSIDE and, for the duration of the
inner policy's daily, replaces the engine verb Game.tableTakeSeat with a
refusing stub. The only sim seat verbs — capable.js's tableRoad and
seatdrive.js's driveSeat — both funnel through Game.tableTakeSeat (table.js;
all four `won = true` sites are downstream of the sit), so every sit is
declined. Invitations are NOT suppressed: tablePreview() still reads live,
the table is still announced, overtime still accrues (the honest cost of
refusing the seat, per docs/TABLE.md). Env-gated NOWINWINDOW=1, default OFF;
unset = pure delegation (the proof's det-gate pins byte-identity with the
vgearconfirm substrate).

This arm's files (all NEW — the r3 family's files untouched):
- scripts/policies/nowinwindow.js — the no-win policy layer (the veto)
- scripts/nowinwindow-instrument-20261021.js — r3 window layer + per-day
  invite/inviteReady/inviteSeat + exiled reads (backlog #760 remainder),
  firstInviteDay tracking; killdisc v2 base NOT modified
- scripts/nowinwindow-sweep-20261021.js — 16-run sweep (8 fresh seeds ×
  {leadfeast, belongfeast}, 180d death-aware), records firstInviteDay,
  inviteReadyDays, exiled/everExiled; LOUD on any win
- scripts/nowinwindow-analyze-20261021.js — post-invitation-window
  attribution analyzer (r3 definitions, window = day >= firstInviteDay)
- scripts/nowinwindow-sense-20261021.js — narration-live sense re-runs for
  unlocking runs (SENSE-TESTING LAW)
- scripts/test-nowinwindow-20261021.js — proof (E0-E4 + D2, all GREEN before
  any sweep)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15)

**PRIMARY (DIAG-GO):** >=95% attribution of wave-4+/wave-5 engagements,
field fights, and kills in the post-invitation window (day >= firstInviteDay
through the 180d horizon), 0 unexplained, 0 instrumentErrors — judged across
runs WITH a table invitation. Attribution definitions identical to r2/r3
(known mid + resolvable wave from data + taxonomy shape + fight-id joined to
a kill record OR a tbOutcome OR explicit unresolved reason:
fled/aborted/unrecorded; unexplained = unresolvable wave OR engagement
without fight-id AND without day+mid fallback kill match).
**MINIMUM:** >=2 runs with an invitation. Below 2 = insufficient-data:
report-only, NOT a failure (diagnostic, no lever killed).
**LAYER-FAILURE (loud, separate from the metric):** any win (Game.won) under
NOWINWINDOW=1. A win means the seat-refusal layer failed — verdict is
layer-failure regardless of attribution numbers.
**Unit:** the run (16). No baseline-vs-variant contrast — diagnostic arm.
**SECONDARY (report, never judge):** wall numbers — wins MUST be 0 (any win
= layer failure, reported LOUD), national ever/end, table reach, wave-4/5
unlocks, wave-5 engagements/fights/kills (by whom, outcomes), window deaths
by mechanism, median/max survival, exiled + everExiled (backlog #760
remainder); firstInviteDay distribution; inviteReadyDays (days the seat was
declined); winTrack (must be null everywhere).
**SENSE-TESTING LAW (mandatory):** any run that unlocks wave-5 is re-run
narration-live and the post-unlock window transcript is READ — judge
meaning, coherence, relevance, consequences. Never the silenced sweep
capture for sense reads.
**Seeds:** 65301–65308 — verified unused: no s<seed>.json in any
evidence/*/perseed-* dir (2026-10-19 through 2026-10-21 corpora), no
collision with any other seed-block naming in the evidence tree.
**Policies:** NW.armedFor(base) — withNoWin(VCE.armedFor(base)) for
{leadfeast, belongfeast}. No control (diagnostic).
**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 VGEAR=1 KILLDISC=1 NOWINWINDOW=1 (asserted up front;
SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset). Sweep FAILS LOUD unless
env matches exactly.
**Horizon:** 180d death-aware (+10d tail max via the harness). The no-win
layer means no win truncation — the window is the full post-invitation span.
**§15 note:** no before/after comparison — diagnostic with no intervention
and no control arm (§15 panel is for lever before/after; same unit note as
r2/r3).
**Metric review:** (every evidence file carries one — filled below.)

## Results

### Sweep

16 runs (seeds 65301-65308 x {leadfeast, belongfeast}, 180d death-aware, NOWINWINDOW=1 over the VGEAR=1 winning substrate). 0 instrument errors, 0 wins (layer held — no layer-failure). 12/16 runs received a table invitation (minimum >=2 met). 13/16 unlocked wave-4; 1/16 formally unlocked wave-5 (s65306 belongfeast, w5Day=89, inviteDay=91, village-lost d103).

Wall (no-win substrate, n=16): won 0/16, national 7/16 (ever 11/16), table 16/16 invited, wave-4 13/16, wave-5 unlocks 1/16, median survival 126d, max 181d, exiled 0/16.

### PRIMARY verdict

**DIAG-GO.** Post-invitation window attribution 221/221 (100.0%) >= 95% bar, 0 unexplained, 0 instrument errors across 12 invited runs. The no-win layer makes the post-invitation window MEASURABLE: without it the win truncates every run at ~d90-130; with the seat refused the window runs to the 180d horizon (or village death).

### SECONDARY (report, don't judge)

- Wave-5 in the window: s65306 belongfeast (1 engagement, unrecorded outcome, died d103, 12d post-invite); s65302 leadfeast (**27 wave-5 engagements**, 1 field fight — villager fled — 0 kills, village-lost d157, 31 window deaths). The door does not close when the seat is refused: wave-5 keeps coming through the whole post-invitation span.
- inviteReadyDays (days the seat was declined): 12-59 across invited runs; the refusal is the honest cost — overtime accrues, standing bleeds (-40 at OVERTIME x6), the Nielsen feeds on stores.
- winTrack null everywhere; won=0 everywhere (layer-failure check clean).
- exiled 0/16, everExiled 0/16 (backlog #760 remainder: no exiles on this substrate).

### SENSE-TESTING

Re-ran s65306 belongfeast narration-live. The post-unlock window reads: wave-5 arrives as "RERUN x5 The Eater" (+125-150% HP), villagers (Ruth, Tao) fight it blow-by-blow, the System taunts the cold chair ("OVERTIME x6! MAXIMUM OVERTIME! The table is still set... Sit -- or don't! We LOVE this!"), villagers gossip by the fire about what the table is waiting for, the Nielsen feeds on stores while they deliberate. Deaths land with weight ("You carry the weight of it. They died beside you."). The refusal has a voice and a price — no silent window, no robotic beats. Meaning: the village chose the window over the seat, and the window is killing them. Coherent, consequential, on-brand.


### Proof gates

`scripts/test-nowinwindow-20261021.js` — **38 passed, 0 failed** (run
2026-10-21, exact substrate env + NOWINWINDOW=1, ~226s). E0 shape (7: exports,
layerOn env read, withNoWin id/desc passthrough, armedFor ids, unknown-base
rejection) · E1 det-gate (3: NOWINWINDOW unset → NW.armedFor trajectories
byte-identical to VCE.armedFor on the same seeds, leadfeast+belongfeast s65301
× 60d, noinstr-vs-noinstr stability pre-check) · E2 RED→GREEN on scripted
stubs (11: RED layer-off sit proceeds; GREEN layer-on engine sit never
called, refusal counted with first-refusal day, verb restored, no downstream
sit recorded, throw-path restore) · E3 read-only static scans (11: policy
zero RNG / zero Game.state writes / exactly the wrap+restore tableTakeSeat
assignments / restore-in-finally / ctx-only nw counters; instrument zero RNG
/ zero Date.now / zero Game.state writes / only the install-time Game.sleep
wrap) · E4 (7: real 60d run through the REAL nowinwindow sweep completes,
zero instrument errors, window trace populated with invite/exiled fields,
won=0, winTrack null) · D2 (1: deterministic re-run byte-identical).
All gates GREEN before any sweep — the sweep is authorized.


## Metric review

- PRIMARY bar (>=95% attribution) met at 100.0% — no re-score needed; the bar was honest and the layer cleared it.
- MINIMUM (>=2 invited runs) met at 12 — the census has substance.
- The s65302 leadfeast case (27 w5 engagements without formal maxWave=5 unlock) suggests the unlock flag undercounts wave-5 pressure — engagements are the truer measure on the no-win substrate. Not a metric change for this arm (attribution counted engagements, not unlocks); flagged for windowreach follow-ups.
- No §14 disputes: pre-registered verdict logic applied as written.


## Convergence

**DIAG-GO — sim-nowinwindow closes backlog #748's named next.** The no-win policy layer (scripts/policies/nowinwindow.js) is proven (38/38 gates green) and the post-invitation window census is complete: 100% attribution, layer held all 16 runs, first real measurement of wave-5 pressure with the win refused. Finding: the wave-5 door does not close when the seat is refused — s65302 took 27 wave-5 engagements across d90-157 and died with the window still open. The window is survivable-but-bleeding, not a second win condition. Instrument-only; zero src/js; the layer stays a sim policy (env-gated, default OFF). #748 marked [fixed] on landing.


