# sim-contactrec-a — PRE-REGISTRATION (written BEFORE any measurement sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp (converging, NOT converged).
Arm type: INSTRUMENT-ONLY precursor to any future contact-finish rule.
NO contact-finish game rule is built here. NO game-behavior change:
the only src/js change permitted is a pure logging emission (two new
keys on the fieldFight return record, no existing field touched, no
RNG draw, no state write); if its determinism gate fails it is
reverted and the arm judges recorder-only (see fallback below).
Everything else is recorder/analyzer/scripts only.

## Question (from sim-contactbreak-a)

Evade rows systematically lack mHpStart/mMaxHp in the landed
fieldfinish2 corpus, and evades are exactly where contact-shaped
rows concentrate, so the judged contact-break share 27/104 (26.0%)
on the baseline leg is a floor, not a point estimate. This arm
fixes the recorder so evade rows capture HP fields, then
re-estimates the contact-break share with corrected fields.

## Canon read first

docs/CANON.md, docs/MONSTER-WAVES.md (wave 3: HP 240-420 in data,
break line 15% for wave >= 2), sim-contactbreak-a.md and its
prereg, sim-finishgate-a.md (which also flags the recorder gap),
sim-fieldfinish2-a.md (sweep/split rebuild recipe; its six
instrument files were lost, so the sweep and splitter are rebuilt
here from the fieldkill recipe, recorder module + env name swapped).

## Root-cause hypothesis (to be proven by the fix + test, not assumed)

1. The recorder (fieldkill-diag.js, copied as fieldfinish2-diag.js)
   captures mHpStart/mMaxHp PRE-call from the world-entity argument
   `m` (`m.hp`, `m.maxHp`).
2. The expedition channel (villager-agency.js expeditionMonster)
   calls `fieldFight(vid, mdef, null, {awareness: true, ...})` —
   `m` is null for ephemeral meetings. Pre-call capture is null.
3. In the landed corpus, ALL 22 missing-HP wave-3 rows are
   caller=expedition (baseline 15, lever 7); all present-HP rows
   are caller=wild/aid (world entity present). The gap is
   channel-shaped, not outcome-shaped — but evades concentrate in
   it (baseline 9/15, lever 4/7 missing rows are evades).
4. The engine itself carries the missing values at evade time:
   members[0] is rolled from mdef.hp, and the awareness evade
   return (fieldFights.js, before ambush/volley/rounds) sets
   rec.mHpLeft = members[0].hp untouched by any damage. So for an
   evade row, opening HP = rec.mHpLeft exactly, and for an
   ephemeral (m=null) meeting, members[0].maxHp =
   max(rolled HP, mdef.hp[1]) = mdef.hp[1] exactly (rolled HP is
   within [lo, hi]).
5. The src emission (rec.mHpStart / rec.mMaxHp set from members[0]
   right after members construction, before every return path)
   therefore closes the gap for ALL rows, including fought
   ephemeral rows whose opening HP no post-hoc fill can recover.
   No engine code reads rec.mHpStart or rec.mMaxHp (verified by
   grep over src/js at prereg time), so the new keys are inert.

## What is built (in order)

1. scripts/policies/contactrec-diag.js — recorder, copied from
   fieldkill-diag.js with env CONTACTREC and three capture rules
   for the fieldFight row, in preference order:
   (a) pre-call m.hp / m.maxHp when non-null (the old path);
   (b) post-call rec.mHpStart / rec.mMaxHp from the src emission
   when present; (c) evade-only exact fill: mHpStart =
   rec.mHpLeft when outcome is evade, and mMaxHp = mdef.hp[1]
   when m is null and mdef.hp is a [lo, hi] pair. Rule (c) never
   fills a fought row's mHpStart (unrecoverable post-hoc) and
   never invents a max: it applies only where §4 proves equality.
   A new field mHpAtContact = rec.mHpLeft is recorded on every
   row for audit.
2. src/js/fieldFights.js — pure logging emission ONLY: after the
   members construction, `rec.mHpStart = members[0].hp;
   rec.mMaxHp = members[0].maxHp;`. No other line touched.
3. scripts/contactrec-sweep-20261031.js + scripts/contactrec-split-20261031.js
   — rebuilt from the fieldkill recipe (same policy stack, same
   stdout-only I/O discipline, same idle splitter pattern),
   recorder module + env name swapped.
4. scripts/contactrec-det-20261031.sh + scripts/contactrec-det-compare-20261031.js
   — det-gates D1 (recorder ON vs OFF) and D2 (emission ON vs OFF,
   recorder OFF), seeds 87104/87127, dayHash arrays + end fields
   byte-identical or the gate fails.
5. scripts/contactrec-analyze-20261031.js — runs the contactbreak
   classifier (imported, unchanged) on a corpus dir and reports
   per-leg CONTACT/FOUGHT/UNCLASSIFIED, evade-row HP capture
   rate, and reconciliation. Plus an old-corpus evade-backfill
   cross-check (see §"Re-estimation plan" item 3), labeled as
   backfilled, never as recorder-measured.
6. scripts/test-contactrec-20261031.js — proof test (synthetic
   recorder-fill cases + classifier cases + corpus reconciliation
   + det-gate result legs). Must pass before the evidence commit
   is reported as done.

## Policy stack, seeds, horizon (binding)

- Stack, identical to the fieldfinish2 baseline leg:
  withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1, plus CONTACTREC=1. NO game lever, NO policy edit
  beyond the recorder wrap.
- Seeds (8, the fieldfinish2 pilot set): 87104, 87109, 87119,
  87124, 87140, 87115, 87123, 87127.
- Horizon: 200 loop-days, death-aware (harness Game.over stop;
  dead villages stop simulating).
- SUBSTRATE NOTE: the old corpus anchor is f554d59a9; current
  HEAD is 1d72a96c3 (coordinator closeout commits landed after
  the fieldfinish2 pilot). The fresh sweep is therefore a NEW
  leg: its trajectories may differ from the old corpus, its
  dayHash arrays are compared to the old corpus as a check
  (reported, not assumed), and its share is NEVER pooled with
  the old legs.

## Re-estimation plan (binding, per leg, never pooled)

1. OLD legs, classifier unchanged: re-run the contactbreak
   classifier on the landed corpora (baseline 27/104, lever 0/71)
   as the floor reference. Expected to reproduce exactly.
2. FRESH leg, fixed recorder: run the classifier on the new
   sweep corpus. This is the PRIMARY corrected estimate.
3. OLD legs, evade-backfill cross-check: apply the §4 equalities
   to old-corpus evade rows ONLY (mHpStart := mHpLeft,
   mMaxHp := band top from src/data/monsters.json hp[1], for
   caller=expedition evade rows with both fields missing) and
   re-run the classifier. This is a CONSISTENCY CHECK on the
   fresh estimate, explicitly labeled backfilled — it does not
   replace the recorder-measured fresh number, and it does not
   re-litigate contactbreak's derivation ban (that ban bound
   that arm's judged counts; this arm's backfill is scoped to
   evade rows where engine order proves equality, and is
   reported separately from the fresh-leg judged number).
4. Sense-testing: read at least 3 contact-break logs from the
   fresh corpus (including at least 1 no-arrows-yet-bow-drive-off
   log if the class occurs) and judge in plain words whether
   the narration reads coherently.

## GO rule (pre-registered, exact bars)

GO iff ALL of the following hold:

1. Evade-row HP capture ≥ 90% on the fresh corpus: fraction of
   wave-3 evade rows with numeric mHpStart AND mMaxHp.
2. Reconciliation 100%: CONTACT + FOUGHT + UNCLASSIFIED =
   total wave-3 rows on the fresh leg, with every unclassified
   row carrying an explicit reason.
3. A corrected contact-break estimate is reported for the fresh
   leg (point share) with its uncertainty stated (floor vs
   corrected, and the unclassified remainder explicitly
   reconciled — how many unclassified rows are contact-shaped
   on visible fields, and what the share would be if they were
   contact).
4. Det-gates D1 and D2 both pass (see fallback).

Otherwise NO-GO — the evidence reports exactly which bar missed,
and a miss is never re-scored against a friendlier metric.

FALLBACK (pre-registered, not a re-score): if D2 (emission purity)
fails, the src emission is reverted in the worktree, the fresh
sweep is re-run recorder-only (rule (c) fill only), and the arm
is judged on the recorder-only leg against bars 1–3, with the
D2 failure and the reversion reported loudly. If D1 (recorder
purity) fails, the run stops: NO-GO, no judged numbers.

## Metric review (to be filled at evidence time)

- Did the recorder fix close the evade gap without moving
  trajectories (det-gates)? Did fought ephemeral rows remain
  unclassified, and do any of them look contact-shaped? Does
  the fresh-leg share sit inside the old legs' floor-to-backfill
  range, or does substrate drift / a new trajectory explain a
  move outside it? Is the no-arrows narration contradiction
  still present in fresh contact logs?
