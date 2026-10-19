# sim-cookbulk-exilewatch-b — adjudication of the "exiled 2 (b3) vs 0 (control)" watch item

Run: fleshout-loop-b-20261019T1030Z (coordinator diagnostic, no new sim budget beyond re-runs).
Base: 6143e6cd680f37e85174ee6114f36a5bfe6c154c (master at run start; sibling landings since).
Source: evidence/2026-10-19/sim-cookbulk-confirm-b.md ("exiled 2 (b3) vs 0 (control) — watch item").
Instrument: ~/workspace/exile-diag-95109.js — re-runs seed 95109 (the only seed with
exiles in the 64-file confirm set) on both policies x {control,b3}, wrapping
Game.exilePlayer to capture (day, how, 40-line say-context). Read-only on the repo.

## Findings

1. Both exiles are the SAME seed (95109), one per policy, both b3-armed:
   - leadfeast/b3: exilePlayer('moot') day 126; belongfeast/b3: exilePlayer('moot') day 112.
   - Controls (both policies, same seed): no exile.
2. The event is the freeloading moot, mechanically honest:
   - "The village gathers. No fire-show, no System — just people, tired.
     'We've carried you long enough,' someone says. 'All in favor of asking them to leave?'
     Hands: 4 for exile, 3/2 against. It's done."
   - Pre-context: "Half ration — they don't trust you yet", "You keep a day's food
     (1170 kcal) — nothing extra for the pantry this time" (scholar foraged and kept).
3. BOTH exiles self-resolved: scholar returned from exile before run end
   (leadfeast/b3 ended d155, belongfeast/b3 d182, `scholar.exiled=false` at end).
   No deaths, no exile-attributed starvation, runs continued past the event.
4. No b3 verb touches the carrying ledger: the layer bulk-cooks village food;
   it has no theft, ration, or standing verbs. The divergence class matches the
   documented #614 instrument lesson (policy-side layers consume game RNG →
   trajectory perturbation). On the rerun, control leadfeast-s95109 ended
   village-lost at d125 — a materially different trajectory window; the moot
   threshold was crossed only in the b3 trajectories.
5. Sense check: the moot reads coherently — a village that half-rations a scholar
   who forages and keeps everything votes them out, 4-3 and 4-2, with the exile
   grace and return path both functioning. This is the design working (Steve's
   "theft allowed, socially punished" / contribution ledger), not a bug.

## Verdict

WATCH ITEM CLOSED — trajectory noise, not layer harm. 2/32 vs 0/32 confined to
one seed family, the event is the honest freeloading moot, self-resolved, with
no plausible b3 mechanism path. No re-score of the landed GO. Standing note for
future sweeps: rare per-seed divergences from RNG perturbation (#614) should be
expected; a formal no-op-perturbation control arm would settle such items
mechanistically when they recur.

Metric review: no metric was pre-registered (diagnostic, not a lever); the
watch item's own frame ("is this layer harm?") is answered NEGATIVE.
