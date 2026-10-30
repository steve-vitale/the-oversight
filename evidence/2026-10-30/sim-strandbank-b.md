# sim-strandbank-b — strand-bank re-derivation: the drift watch answer

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1730Z
(coordinator task; worker spawned 17:42 CDT), arm sim-strandbank-b,
axis food-economy. Worktree sim-strandbank-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero policy files created or edited, no behavior probe
built, run, or judged, no driver edited (OUTDIR override only).
Sibling trees (Loop A: sim-w4field-a, sim-w4party-a,
sim-linkgen-a; journey trees; gapscomp trees) never touched.
The main tree never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-strandbank-b-prereg.md (commit
07b48924f). Pinned base 359a384cc3ff7516235c52777ef66bccd4c01f11
(worktree HEAD at prereg writing time; the prereg commit adds
only the prereg file, so the legs run on pinned-base game code
verbatim). Primary question (backlog #1554): re-derive strand
membership per base — which seeds strand, on which days, on
the current base — and localize any drift vs the wakeforage
fresh baselines, per seed.
DIAG-GO bars, judged exactly as written: (a) driver runs clean
on all 10 seeds × 2 legs, 0 instrument errors; (b) recorder
equivalence — per-seed counts match the driver legs exactly,
every mismatch named if any; (c) strand set reported per seed
with strand days; (d) drift vs wakeforage fresh baselines
localized per seed; (e) determinism re-run byte-identical on
at least one leg (here: the full ON recorder leg); (f) proof
suite green. §15 panel: NO panel compare .md — DIAG instrument
with zero src/js and zero policy changes, so there is no
game-root before/after delta for a panel to compare (same
standing as the walktree and wakeforage preregs). The drift
table below is a census comparison across base pins, not a
panel comparison, and is never labeled one.

## Instruments (reused verbatim, not reinvented)

- Master driver: scripts/woodday-trace-b.js, OUTDIR override
  only, WOODDAY unset (probe off). Env asserted FATAL on every
  leg: POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank
  15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337,
  15376, 15439; guard + ON legs.
- Recorder: scripts/wakeforage-trace-b.js, OUTDIR override
  only, guard + ON legs (its read-only sweep additions are
  the instrument future strand arms will quote; bar (b)
  re-proves its neutrality here).
- Analyzer: scripts/analyze-woodday-b.js (pure reads; strand
  = maximal run of still-refused creek evenings on
  consecutive loop-days).
- Proof: scripts/test-strandbank-b.js (10/10, see below).

## Verdict: DIAG-GO (all bars hold)

| bar | result |
|-----|--------|
| (a) driver clean, 10 seeds × 2 legs, 0 instrument errors | PASS — every seed survived 30 days on every leg, errs 0, 30 evening rows per seed per leg |
| (b) recorder equivalence, per-seed, both legs | PASS — MATCH on every per-seed creek/still/rescued count, both legs; guard warmth acted 0 |
| (c) strand set per seed with strand days | PASS — table below, derived from analyzer censuses, cross-checked against corpora |
| (d) drift vs wakeforage fresh baselines, per seed | PASS — localized: ZERO drift on every seed, both legs (table below) |
| (e) determinism, full ON recorder leg re-run | PASS — all 10 files byte-identical |
| (f) proof suite green | PASS — scripts/test-strandbank-b.js 10/10 |

## 1. THE STRAND SET ON CURRENT MASTER (the answer to #1554)

Does 15009 strand again? NO. Does any new seed strand? NO.
The strand set is exactly one seed, on both legs:

| leg | creek | still | rescued | warmth acted | log-spent | strands |
|-----|-------|-------|---------|--------------|-----------|---------|
| guard (fresh) | 12 | 3 | 9 | 0 | 0 | 15215 nights 7–9 |
| ON (fresh) | 18 | 10 | 8 | 6 | 4 | 15215 nights 7–16 |

15215 evening woods, ON: 4, 4, 4, 3, 3, 2, 1, 0, 0, 0
(nights 7–16); post-evening woods: 4, 4, 3, 3, 2, 1, 0, 0, 0, 0
(spends nights 9, 11, 12, 13 — the same spend pattern
wakeforage reported). Guard evening woods: 4, 4, 4 (nights
7–9, no warmth, no spends). Strand pairs: 0 positive / 9
zero / 0 negative deltas ON, 0/2/0 guard — the pack still
never recovers inside a strand. Adjacent-wood window
mornings: 0 on both legs; full-tile bigtrees on the wake
tile: 8 on every stranded morning, none adjacent — the
woodday picture is unchanged too.

Per-seed table (creek / still / rescued), identical on the
driver and recorder legs:

| seed | guard | ON | strands? |
|------|-------|----|----------|
| 15003 | 1 / 0 / 1 | 1 / 0 / 1 | no |
| 15009 | 0 / 0 / 0 | 0 / 0 / 0 | NO — not even a creek evening |
| 15091 | 1 / 0 / 1 | 1 / 0 / 1 | no |
| 15211 | 2 / 0 / 2 | 2 / 0 / 2 | no |
| 15215 | 4 / 3 / 1 | 10 / 10 / 0 | YES — guard 7–9, ON 7–16 |
| 15220 | 0 / 0 / 0 | 0 / 0 / 0 | no |
| 15221 | 0 / 0 / 0 | 0 / 0 / 0 | no |
| 15337 | 1 / 0 / 1 | 1 / 0 / 1 | no |
| 15376 | 2 / 0 / 2 | 2 / 0 / 2 | no |
| 15439 | 1 / 0 / 1 | 1 / 0 / 1 | no |

## 2. DRIFT vs WAKEFORAGE FRESH BASELINES (localized per seed)

Wakeforage fresh baselines: guard 12/3/9, ON 18/10/8; only
15215 strands (ON days 7–16, guard days 7–9). This run's
fresh baselines are IDENTICAL at every level:

- Totals: guard 12/3/9 = wakeforage 12/3/9 (delta 0/0/0);
  ON 18/10/8 = wakeforage 18/10/8 (delta 0/0/0).
- Per seed, both legs: delta 0/0/0 on ALL TEN seeds. This
  was checked two ways: against the published wakeforage
  totals, and by re-running the proof's census over the
  wakeforage base corpora themselves in this worktree
  (sim-wakeforage-b-corpus-base-guard/-on) — the
  re-derived wakeforage per-seed table equals this run's
  per-seed table cell for cell.
- The 15009 strand loss therefore STANDS, unchanged, on a
  third base: 15009 has 0 creek evenings on both legs here,
  exactly as on the wakeforage base. It did not come back,
  and it did not partially come back (no rescued creek
  evening either — the seed never meets a creek evening
  at all in this window).
- The 15215 strand is likewise UNCHANGED for a third
  consecutive base: same nights, same evening woods, same
  warmth 6 acted / 4 logs spent ON, same guard 7–9 shape.
- No seed moved in either direction. The drift watch
  answer for this base is: no drift since wakeforage.
  The drift that #1554 records (walktree → wakeforage:
  15009's strand lost, rescued counts shuffled on four
  seeds) is historical, not ongoing — nothing further
  moved between the wakeforage pin and this pin.

## 3. WHAT STRAND ARMS MAY QUOTE NOW (and what they may not)

- QUOTE AS CURRENT (this base): the strand set above —
  15215 only, guard nights 7–9, ON nights 7–16, evening
  woods as listed, guard 12/3/9, ON 18/10/8. The next
  strand arm on this base does not need to re-derive the
  bank; it needs to re-derive it again only after the
  next base move.
- DO NOT QUOTE AS CURRENT: any bank that includes 15009
  as a stranded seed (walktree-era), and any rescued
  count from the walktree pin (guard 15/4/11, ON 21/11/10).
  Those are two pins stale now, and the walktree→
  wakeforage shuffle is exactly the failure mode #1554
  warns about.
- The recorder (wakeforage-trace-b.js) is re-proven
  behavior-neutral on this base (equivalence MATCH,
  both legs), so sweep-based strand arms may quote its
  mornings as trajectory-true here.

## 4. SENSE-READ (one strand story, read end to end)

Fresh ON corpus, seed 15215, night 10 — the story is the
same story wakeforage read, beat for beat, which is itself
the finding: the villager wakes at (8,0), the east corner
of the creek tile (2,5), with 0 kcal and 3 logs, standing
in a sweep that holds known muscadine (the recorder's
sweep cell (7,0) is muscadine, assigned, known). The day
travels to wetland, works a patch ("8× Purslane, 240
kcal"), eats it, travels back to the creek, and is refused
honestly on wood — "No bridge tonight — the pack holds
3 logs, and a bridge needs 4" — then the failed fire costs
70 kcal for "Nothing. Your arms ache." The warmth record
agrees (acted, fireLit false, logSpent 0, 240→170 kcal).
The narration is coherent and the numbers match the
record at every step; the only wrinkle is the same
pre-existing ambient one wakeforage and woodday noted —
"fragments by the fire" gossip lines on a night with no
fire lit. Not a lie about food or wood, not chased here.
What the story still says, plainly: the villager wakes
in known food, eats a smaller meal later, and is stopped
by one missing log — the strand is a wood story with a
food footnote, not the other way round.

## Village assessment (plain words)

The banked villages are the same working villages the
last two arms saw: all 10 survived 30 days on every leg
(ceiling effect of the window + banking selection, not a
survival claim). The bank has narrowed to a single
stranded seed and stayed there: 15215 is the only village
whose scholar sleeps out by the creek, three nights
without warmth fires and ten nights with them, burning
its bridge logs down 4→0 while the other nine villages
cross or come home. 15009, the bank's second stranded
seed two bases ago, does not even visit a creek evening
anymore — whatever moved its route between the walktree
pin and the wakeforage pin has held through this pin.
Nothing else drifted: no seed gained or lost a creek
evening, no rescued count shuffled, no warmth count
moved. For the next arm, the bank is stable and small —
one strand to study, nine villages that do not strand —
and that stability is the result, not a lack of one.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Wave reach on the fresh
legs (corpus maxWaveUnlocked, both legs identical):
wave 1 in 10/10 banked villages, wave 2 in 8/10, wave 3
in 1/10, waves 4–5 in 0/10 in this 30-day window.
Integration stages seen in evening rows run 0–3; no
national/table field exists in these corpora.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field)
for national / table / wins — reported, never zeros. No
national, table, or win claim is made or implied by this
run. What IS observable on this band: median survival 30
days (all 10 seeds survived 30 days on both legs — the
window ceiling, not a survival claim); wave reach as
above (wave 3 in 1/10, waves 4–5 in 0/10); scholar
endReason "survived" 10/10 on both legs.

## Proof

scripts/test-strandbank-b.js: 10/10 checks pass,
including: census totals on all four legs; equivalence
MATCH per seed on both legs; guard warmth acted 0;
recorder errs 0; 30 evening rows (days 1–30) per seed per
leg; strand sets derived from censuses cross-checked
against corpora still-days; drift table computed per seed
against both the published wakeforage totals and the
re-derived wakeforage base corpora (all zeros);
determinism re-runs byte-identical (full ON recorder leg,
all 10 files); tracked diff guard: src/ and
scripts/policies/ between pinned base 359a384cc and final
tree are EMPTY — the proof script and evidence files are
measurement only.
Instrument notes (disclosed): the first determinism leg
was cut short at 7/10 files when its supervising poll
aborted mid-run; it was re-run in full (10/10 written,
errs 0) and only the complete re-run is judged — no
number from the partial leg is quoted anywhere. The
recorder driver's final log line still says "walktree
files" (the cosmetic leftover wakeforage already
disclosed; data unaffected).

## Metric review

- The creek/still/rescued census remains the right strand
  instrument for a no-variant DIAG arm: it separated the
  strand (15215) from the non-stranding villages cleanly
  and its per-seed form caught what a totals-only check
  could have hidden (here: nothing moved, which the
  per-seed zeros prove rather than assume).
- The 30-day window still contains the full strand cycle
  on this base (guard 7–9, ON 7–16, both < 30); no
  horizon revision is proposed. If a future base pushes
  a strand past day 30, the horizon must be revisited for
  the NEXT run, not stretched mid-run.
- Per-seed localization proved its worth in the negative:
  a net-delta-only report would have said "no drift" and
  been right by luck; the per-seed zeros say it by
  construction, and they are what let this run state that
  15009 did not partially return.
- The §15 panel non-applicability declaration held: with
  zero game-root changes, there was nothing to panel, and
  the census comparison across pins is reported under
  its own name. A future arm that changes a policy
  default or src/ must NOT reuse this declaration — it
  must produce the panel compare.
- No metric revision is proposed. The next run that
  quotes this bank should cite this file's strand set,
  and the run after the next base move should re-derive
  it again — that is the standing rule #1554 states, and
  this run is an instance of following it, not a reason
  to retire it.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — food-economy/drift — 15009 STRAND
  LOSS STILL UNEXPLAINED (this arm + wakeforage): the
  loss is confirmed on a third base and its shape is now
  precise — 15009 meets zero creek evenings in the window
  on either leg, not merely zero still evenings — but
  which landing between the walktree pin and the
  wakeforage pin moved its route is still uninvestigated.
  The drift watch is satisfied (the bank is re-derived);
  the cause is not. (evidence: sim-strandbank-b fresh
  censuses vs sim-wakeforage-b fresh baselines.)
- [open] 2026-10-30 — food-economy/narration — FIRESIDE
  GOSSIP ON FIRELESS NIGHTS, FOURTH SIGHTING (this arm,
  15215 ON night 10): "fragments by the fire" lines
  continue on stranded nights where no fire was lit.
  Ambient and pre-existing, not a lie about food or
  wood. No wording change proposed here.

## Files

- Prereg: evidence/2026-10-30/sim-strandbank-b-prereg.md
  (commit 07b48924f; pinned base 359a384cc)
- Evidence (this file): evidence/2026-10-30/sim-strandbank-b.md
- Proof: scripts/test-strandbank-b.js
- Baselines (woodday driver): evidence/2026-10-30/
  sim-strandbank-b-corpus-base-guard, -base-on;
  censuses: sim-strandbank-b-census-base-{guard,on}.json
- Judged recorder corpora: evidence/2026-10-30/
  sim-strandbank-b-corpus-guard, -corpus-on;
  censuses: sim-strandbank-b-census-{guard,on}.json
- Determinism: evidence/2026-10-30/
  sim-strandbank-b-corpus-determinism (full ON recorder
  leg re-run, all 10 files byte-identical to the judged
  ON corpus)
