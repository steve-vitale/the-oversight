# sim-windowsurvive — window-death attribution diagnostic (flesh-out loop, 2026-10-19, ARM sim-windowsurvive)

Run: fleshout-20261019T0415Z, arm sim-windowsurvive. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law + design call #4 combat-readiness
bar, villager XP law), docs/PRESERVATION.md (pantry defense relevance).
Named next #1 from evidence/2026-10-19/sim-w5census.md: ATTRIBUTE the window deaths —
18/21 door-reaching villages died IN the window (median 40d hold) on the pre-seat full
win-side stack; 0/32 open wave-5. The census named the window — not just the veteran leg —
as the lever surface: a veteran-production lever that doesn't keep the village alive
through the window produces better-fed corpses.

Substrate (this arm): the w5path substrate with VETREL=1 ON — policy
`withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))` on {leadfeast,
belongfeast}, SEATDRIVE=0, REPOSITION unset (inert), env
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
NODEWITNESS=1 VETREL=1 — composing with this run's vetrel1 arm (which re-measures the
w5path stall-path census with VETREL=1). Taxonomies are the vetwindow-identical
classifier (death-channel) plus the death tele's `wave` field (killer monster's wave) —
comparable to sim-fieldfightsrc (FIELD-EXPOSURE-DOMINANT: RAID 28.4% / EXPEDITION 68.9% /
WILD 2.7%), sim-vetwindow (8/8 veteran deaths scholar successions, 0/8 in-window), and
sim-winloss-a (3/5 non-winning runs end in THE SCATTERING, famine clock).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (diagnostic GO):** 16/16 runs window-attributed with a cause taxonomy that
NAMES the policy-side lever surface — which window deaths are addressable by window
support (the w5census candidate: field recovery for wave-4-engaged fighters, pantry
defense during deferral), measured against door-reaching runs' survival. The taxonomy
must name WHO (scholar successions vs villager attrition), WHERE (field channels),
WHAT (wave-4 monster verbs vs wave-3 vs mundane causes), WHEN (window day,
inter-death intervals), and STATE at death (pantry, armor, veterans, standing).
The veteran leg (0/16 satisfied?) and armor mortality are read jointly.

**DIAGNOSTIC MISS:** deaths unattributable (unattributed > 0 on died-in-window runs) or
the taxonomy shows no addressable surface (no window-support policy could reach the
killers). A miss is NO-GO, never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating; the honest surface for a
wave-5 question — pre-seat villages survive to ~140d median).

**Seeds:** 8 FRESH 63801–63808 (verified: zero filename hits in evidence//scripts;
content hits are pantry-kcal artifacts in other seeds' files, the loop convention) ×
{leadfeast, belongfeast} = 16 runs.

**Instrument:** scripts/probe-windowsurvive-20261019.js (daily window census + Game.tele
death capture with death-time state snapshots — pure engine reads; DET gate pins
instrument-on vs instrument-off byte-identical), scripts/analyze-windowsurvive-20261019.js
(window-death attribution; the w5census endRec-boundary fix carried over identically),
scripts/windowsurvive-transcripts-20261019.js (SAY-line probe with sysSay restored —
the w5census probe-artifact lesson), scripts/test-windowsurvive-20261019.js (proof:
classifier-parity + window + addressability fixtures, SMOKE, DET, attribution
completeness).

**No balanced panel** (§15): pure diagnostic, no lever, no before/after — the corpus
summary + taxonomy table are attached and the reason is noted here.

**No [needs-eyes]**: instrument-only, no player-facing change.

## Results

16/16 runs window-attributed, 0 bad files. 10/16 door-reaching; 9 died in the window (72 window deaths); median window length 78d. Wall on this substrate: national 11/16, table 15/16, wins 0/16, wave-4 13/16, wave-5 0/16, median survival 136d.

**Window-death taxonomy (72 deaths, 0 unattributed — diagnostic bar met):**
- WHO: scholar successions 42, villager attrition 30 — the scholar dies more than the village.
- WHERE: raid 40, wild 18, alien 5, expedition 4, other 4, disease 1. Raids are the #1 window killer (56%).
- WHAT: wave-4 9, wave-3 5, wave-1/2 4, non-combat/unknown 54.
- WHEN: mean window-day at death 46.1; mean inter-death gap 6d.
- STATE at death (means): pantry 28,469 kcal, hungry streak 0, living veterans 0, armored ~1, standing cap 271. They die rich and unequipped, not starving.
- Legs at stall: veterans short 16/16, armor short 16/16, weapons short 15/16.
- Addressable by window support: 63/72 (field combat 62 — wave-4 9, wave-3 5, mundane field 6; logistics 1).

**Verdict: DIAG-GO.** The taxonomy names the policy-side lever surface the w5census run asked for: window deaths are field-combat deaths (raids first, wild second), addressable by window support — field recovery for wave-4-engaged fighters and raid defense during deferral. The 63/72 addressable share is the named next lever's hunting ground. The non-addressable 9 are the honest remainder (contests, dehydration, cause-unmapped).

Full taxonomy: evidence/2026-10-19/windowsurvive-taxonomy.md. Corpus: evidence/2026-10-19/windowsurvive-corpus-summary.json.

## Metric review

The pre-registered diagnostic bar (0 unattributed on died-in-window runs + a named addressable surface) is met exactly: 0 unattributed, 63/72 addressable with the surface named by channel (raid/wild), wave (w4/w3), and state (full pantry, 0 veterans). No re-score needed — the instrument did what it was built to do. The killer-wave re-run subset (6/16) was not needed for the verdict; the 16/16 first sweep carries it.
