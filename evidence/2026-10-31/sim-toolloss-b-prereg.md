# sim-toolloss-b — prereg (committed BEFORE any judged leg)

Run: Loop B fleshout-loop-b-20261031T1230Z, arm sim-toolloss-b,
axis food-economy. DIAG ONLY: new files only (this prereg, driver +
analyzer + proof, evidence, corpora, table). Zero src/js changes, zero
policy-default flips, zero edits to existing policy files or scripts.
Pinned game base: this commit's parent (prereg adds only itself).

## Question (from sim-findings, claimed for this run)

On the 15215 strand trajectory (Loop A sim-fellrepeat-a, ON leg),
morning cutInfo('bigtree') reads tier whittle / Stone knife on days
8-16, then tier "none" / "bare hands" on the day-17 return morning,
with no recorded loss event in that corpus. What removes / replaces /
drops the Stone knife between the day-16 and day-17 mornings, and by
what mechanism? Candidate mechanisms to discriminate (do not assume):
durability break, deliberate drop / deposit, corpse-loot swap,
succession handover, inventory-cap eviction, a prototype-policy side
effect, or a recording artifact (cutInfo reading a different villager /
a stale field).

## Substrate (verbatim from sim-morningcarry-b / sim-fellrepeat-a)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 guard / 1 ON, DAYS=30, NO
prototype policy. Driver: scripts/toolloss-trace-b.js, adapted from
scripts/fellrepeat-trace-a.js with READ-ONLY additions in kind:
(a) every morning snap and every evening row carries a full inventory
snapshot — scholar id/name, every inventory stack (id, name, units,
kg, kcalEach, material, plantId), and the equipped map;
(b) every evening row carries an evening cutInfo('bigtree') snap, so
the transition is bracketed morning -> evening -> morning per
loop-day; (c) full day transcripts stored for loop-days 14-18 on every
leg (plus the fellrepeat conditions), and per-day knife-line scans
(lines mentioning "knife") stored for loop-days 14-18; (d) no verb
calls, no state writes, no RNG draws beyond the base policy stack.

## Seeds and stages

- PILOT: ON leg on the morningcarry 8-seed band (15003, 15009, 15091,
  15211, 15215, 15220, 15221, 15337) + guard leg on 15215 only (the
  contrast leg for the known trajectory). Pilot cost ~8-9 seed-runs.
- CONFIRM (only if the pilot shows the drop on any seed beyond 15215,
  i.e. the phenomenon is not a single-trajectory quirk): guard leg on
  the full 8-seed band. If the drop appears ONLY on 15215 ON, no
  confirm band is spent — the arm is a single-trajectory diag and the
  evidence says so; a rate claim is never made from it.
- Horizons: death-aware, DAYS=30 window as in the strand arms (the
  transition is at day 16-17; dead villages stop simulating).
- Determinism: 15215 ON re-run must be byte-identical to the judged
  15215 ON file, as in fellrepeat-a.

## DIAG-GO threshold (binding)

DIAG-GO iff the judged corpora yield a complete per-morning
cutInfo + full-inventory table covering every strand morning in the
15215 window (guard mornings 8-10, ON mornings 8-17) AND the
day-16 -> day-17 transition is bracketed to a single loop-day segment
(morning day 16 -> evening day 16, or evening day 16 -> morning day
17) with the loss event NAMED and traced to a code path (function +
file, verified by reading the code, not by guessing from the
transcript), OR — if no loss event is observable — the bracket plus
the excluded mechanisms are named and the residue is stated as an
explicit unknown with the exact next instrument that could close it.
A table that merely re-shows "none on day 17" without the bracket is
NO-GO.

## Judged numbers

- Per-morning table (15215, both legs): loop-day, strand morning?,
  cutInfo tier/toolName/canFell, scholar id/name, Stone knife present
  (inventory vs equipped vs absent), full inventory row reference.
- Transition bracket: last snapshot WITH the knife, first snapshot
  WITHOUT it, and the full transcript of the loop-day(s) spanning
  them, with knife lines quoted verbatim.
- Pilot band table: per seed (ON leg), drop observed? (yes/no +
  transition loop-day), strand reached?, days alive.
- Sense-test: transcript read around the transition — a villager
  losing their only knife must be narrated or explainable, not
  silent; judge and quote.

## Metric review (required, §14)

Pre-registered metric is completeness + bracket + traced mechanism,
not a rate: the GO bar is a complete table and a named mechanism.
If the pilot shows the drop is a recording artifact (e.g. the morning
snap reads a different bearer on day 17), the "mechanism" verdict is
the artifact itself — that is a GO outcome, not a re-score. No
metric revision is proposed in advance; any revision goes in the
evidence file's metric-review section for the NEXT run.

## §15 panel

Not applicable as a game comparison: zero game-root changes, so there
is no before/after game delta for scripts/balance-panel.js to compare.
The before/after here is morning snapshots vs evening snapshots on
the same legs, and it is never labeled a panel comparison. A
compare/table artifact (the per-morning table JSON + analyzer output)
is still attached.
