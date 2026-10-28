# sim-grantdeath-b — PREREGISTRATION (committed BEFORE any judged trace run)

Run: oversight-flesh-out-loop-b, arm sim-grantdeath-b, axis
food-economy. DIAGNOSIS ONLY: zero src/js changes, zero
default flips, zero edits to scripts/grantpersist-trace-b.js
(it is copied, never modified, to scripts/grantdeath-trace-b.js
and extended there). NEW scripts:
scripts/grantdeath-trace-b.js (death-cause trace instrument),
scripts/test-grantdeath-b.js (proof),
scripts/analyze-grantdeath-b.js (corpus summarizer). NEW
evidence: this prereg, per-seed trace files under
evidence/2026-10-28/sim-grantdeath-b-corpus/, and
evidence/2026-10-28/sim-grantdeath-b.md.

## Gap (follow-up to sim-grantpersist-b, run fleshout-loop-b-20261028T1530Z)

sim-grantpersist-b (evidence/2026-10-28/sim-grantpersist-b.md,
DIAG-GO) localized all 7 grant losses to the overnight
sleep/endDay window via playerDeath (src/js/ledger.js:629)
-> mantleBecome (src/js/villager-build.js:547), but the
trace never recorded WHAT killed each bearer. Last tap days
showed healthy bearers (health 71-100). Two bearer deaths
to explain:

- seed 10041: gen_m82yaz8 -> gen_31thg6x (3 keys lost:
  animal_ken.read_beast, fear_aura.menace, molt.shed_skin).
- seed 10042: gen_snpynyq -> liam_davis (4 keys lost:
  ambush.lay_wait, blood_trail.follow_blood,
  patient_aim.clean_shot, scarecrow.stage_injury).

## The death-cause instrument (what counts as a named cause)

scripts/grantdeath-trace-b.js is a COPY of
scripts/grantpersist-trace-b.js (same grant, same competent
policy, same 2 lead + 5 tap days, same tap sequence, same
honesty rules, same snapshot brackets), extended ONLY with
overnight death-cause capture:

1. A wrapper on Game.playerDeath (installed after setupGame,
   re-asserted at each tapday-start; reinstalls counted),
   recording per call: the cause argument verbatim, the
   caller's stack frames (first game-code frame below the
   wrapper, so the firing site is named, not guessed),
   game day + dayTicks at the call, the outgoing bearer's
   id, and the bearer's body state at entry (health, kcal,
   hydration, wounds count, diseases keys) — recorded
   BEFORE the original runs, since the original mutates
   the scholar.
2. A wrapper on Game.registerDeath recording its opts
   (kind, villagerId, cause, killerId, player flag) per call.
3. The global say-line capture is now RETURNED in full
   (grantpersist captured say lines but dropped them from
   the output except inside tap windows), so the overnight
   window's narration is quotable, including the
   playerDeath say line ("<name> is dead — <cause>...").
4. Per tapday-start snapshot, the bracket window since the
   previous snapshot is attached: death events fired since
   then, fallen-roster entries added since then
   (state.village.fallen diff), telemetry death records
   added since then (state.telemetry type 'death'), and
   the say lines spoken since then. This names the window
   precisely: sleep tickAction, endDay/resolveDay, or the
   next day's morning waits — whichever the death event's
   own dayTicks and the bracket show, not the grantpersist
   shorthand "overnight".
5. Snapshots gain body fields (health, kcal, hydration at
   snapshot time) so the last-present snapshot's body can
   be compared with the death entry's body without
   inferring a cause from them.

A cause counts ONLY if the window records it: a
playerDeath cause argument, a registerDeath cause, a
fallen entry cause, or a telemetry death record, with the
firing code path traced via the wrapper stack. A cause
guessed from health/kcal alone (e.g. "low kcal, so
starvation") does NOT count, even if plausible. If no
instrument records a cause for a death, that death is
reported UNRECORDED with exactly what is missing — a
documented DIAG finding, not an invented cause.

## Band (judged)

- Seeds: 10040-10047 (8 seeds — the full grantpersist
  pilot band, so the original seeds 10041/10042 are
  inside it).
- Keys: the same 15 grantpersist keys.
- Horizon: 2 lead + 5 tap days per instance (120
  instances), substrate gates asserted FATAL by the
  driver: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1.
- Output: one trace file per (seed, key) under
  evidence/2026-10-28/sim-grantdeath-b-corpus/, named
  grantdeath-b-s<seed>-<ability>.<action>.json.
- The full 8-seed band is the plan. A focused rerun of
  only the 7 loss instances is allowed ONLY if
  determinism is first verified to reproduce the same 7
  losses (same seeds, keys, bearer pairs); that
  verification, if used, is reported in the evidence
  file. Otherwise the full band stands.

## Primary metric and GO threshold (pre-registered, §14 binds)

Primary metric: death cause named for 2/2 bearer deaths
(seed 10041's gen_m82yaz8 death, seed 10042's
gen_snpynyq death), each with the overnight window
(sleep / endDay / morning waits, as the death event's
own dayTicks and bracket show) and the code site that
fired it (playerDeath caller frame + the game-code path
behind it, e.g. endDay -> resolveDay -> playerDeath,
or a field/contest damage path).

- DIAG-GO: 2/2 named by a recorded cause (per "what
  counts" above), each with window + firing site.
- DIAG-PARTIAL: 1/2 named. (Not GO.)
- DIAG-NO-GO: 0/2 named.

The per-instance table is published for all reproduced
loss instances: if instances of one seed disagree on
recorded cause, every recorded cause is published
verbatim and the disagreement is flagged — each
instance is a separate game, so disagreement is a
finding about divergence, not a reason to pick one
cause silently. A seed counts as named when its
reproduced loss instances carry recorded causes with
firing sites; an instance with no recorded cause is
listed UNRECORDED and, if it is the seed's only
reproduced loss instance, breaks GO for that seed.

Secondary (reported, never re-scored as the verdict):
reproduction of the 7 grantpersist losses (same seeds /
keys / bearer pairs), window classification per death
(sleep tick vs endDay vs morning waits), fallen-entry
and telemetry agreement with the playerDeath cause,
and the sense-testing read of the overnight death
narration.

## Proof (before any judged band)

scripts/test-grantdeath-b.js must pass green BEFORE the
judged band runs, including synthetic legs proving:
(a) the playerDeath wrapper records the cause argument
verbatim and a caller frame; (b) the registerDeath
wrapper records its opts; (c) the bracket window
attaches death events + fallen diff + say lines to the
correct tapday-start snapshot; (d) the analyzer's
cause-naming rule rejects a health/kcal-only guess
(UNRECORDED, not a cause). A proof failure blocks the
judged band; no judged file is written before the
proof is green.

## Honesty rules (carried from grantpersist)

No clock-setting, no tickAction, no kcal/health top-up,
no tap-position steering, no editing of
grantpersist-trace-b.js, no src/js changes in this arm.
Wrappers are read-only observers: they record and then
call the original; they never alter a return value, a
cause, or game state. If the EPERM write flap hits, use
the in-memory-flush pattern; never force a write.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

This diagnosis has NO before/after game leg: zero game
changes, zero lever variants, nothing to panel. Panel
metrics (national/table/wins) do not exist for 7-day
instances and are not estimated. So NO balance-panel
compare .md is produced for this arm, as in the
grantpersist arm.

## Metric review (carried — judged against this prereg as written)

Pre-registered metrics bind the run (§14). A miss is
DIAG-PARTIAL or DIAG-NO-GO as defined above, never
re-scored against a friendlier metric mid-run. If the
metric proves wrong, it goes under "metric review" in
the evidence file and any revision applies to the NEXT
run. Every evidence file carries a "metric review"
section.
