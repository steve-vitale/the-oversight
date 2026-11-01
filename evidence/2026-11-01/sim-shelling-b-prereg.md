# sim-shelling-b — PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1430Z,
axis food-economy, arm sim-shelling-b. Worktree sim-shelling-b.
Turns the packcomp arithmetic counterfactual into a REAL run:
packcomp proved shelling ALONE flips 51107 (32 acorns, best shelled
pack 3,616 kcal, 10 returns over 2,000) and fails 51103/51104/51108
on haul SIZE (best combined packs 1,200 / 1,200 / 565), never
within 800 kcal of the keep. Identification alone flipped nothing.
This arm tests ONLY the shelling habit, on FRESH seeds, with tick
costs actually charged. The haul-size question is a separate next
blank, NOT this arm's job; it is reported descriptively only.

## Canon read

docs/CANON.md first, then docs/PRESERVATION.md (food ladder; shell
is a preparation step, net < gross — "shells weigh"). No canon doc
covers a shelling habit as such; the habit below is a PLAYER
ACTION using the existing engine verb Game.shellNuts (food.js),
not a new system and not canon invention: the verb exists, its
button exists (app.js data-shell / data-stash-shell), its cost
(4 ticks per call) and yield (net = round(gross x 0.75) per lot)
are engine facts. Prior art, NOT reused: scripts/policies/
shellcounter.js and shellrevive-b.js shell the COUNTER batch and
put it away to the pantry (a pantry deposit, not a return unload);
the shellcounter arm was killed on its starvation guardrail. This
arm deliberately differs (see Habit, and the counter-vs-pack note
below) and imports neither file.

## Substrate (identical to depositkeep / packcomp)

- Policy: competent, unmodified (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=0, DAYS=30). No other env flag = 1.
- DEPOSITGATE=0 means the homecoming keep is 2,000 kcal (gate-off
  substrate from depositkeep). Gate-off also disables meal-share
  easing and haul holdbacks, as in depositkeep — inherited caveat,
  not re-litigated.
- Window: 30 days, competent, death-aware horizon (dead villages
  stop; no fixed 200d). A 30d pre-seat window CANNOT measure
  national / table / wins — none is claimed; wall numbers are
  reported in-window only (wave reach, survival, death causes).

## Habit (policy-side layer, zero src/js changes)

New policy file scripts/policies/shelling-b.js exports the habit
and pure helpers; the driver applies it ONLY on the armed leg by
wrapping Game.returnToVillage. The baseline leg runs the identical
driver with the wrapper OFF. Nothing else differs between legs.

TRIGGER — "on return": on every returnToVillage call in the armed
leg, BEFORE the original runs (i.e. before the haul block splits
keep/give and before unprocessed lots are staged to the counter):

- Fire iff ALL hold: scholar alive (Game.over false at entry);
  not in combat (no tbfight) and no active contest; scholar
  inventory holds >= 1 lot with foodKind 'nut' AND foodState
  'in_shell'; day-budget guard holds (see below).
- ACTION: shell EACH in-shell lot INDIVIDUALLY, in pack order,
  via Game.shellNuts(idx) — one engine call per lot, so the
  engine charges 4 ticks PER LOT (packcomp's figure), never one
  flat 4-tick call for the whole batch. shellNuts transforms in
  place (foodState 'shelled', kcalEach = round(gross x 0.75),
  edible true); indices are re-scanned after each lot, so no
  lot is skipped or double-shelled.
- DAY-BUDGET GUARD: fire only if scholar dayTicks + 4 x (lots)
  < 512 (TICKS_PER_DAY). Otherwise SKIP with reason 'late-day':
  tickAction(4) at the day edge would trigger endDay BEFORE the
  haul block runs, which would reorder the return. A skip is
  recorded, never silently treated as a fire.
- Other skips recorded with reason: 'combat-or-contest',
  'game-over-at-entry', 'no-in-shell-lots' (not an eligible
  return at all — see Eligibility).
- WHY PACK, NOT COUNTER (design decision, stated now, not
  mid-run): the haul block inside returnToVillage is the ONLY
  path by which a return unloads. In-shell lots staged to the
  counter cannot unload that return, and counter-shell +
  putAwayFinished is a pantry deposit, not an unload — it was
  already tried (shellcounter, killed). A habit judged on
  unload MUST therefore shell the pack before the haul block.
  The brief's "at camp / on return" is operationalized as: the
  return arrival at camp, immediately before the haul split.
  The brief's "camp evenings" are the live returns themselves
  (each live return ends an evening at camp). Counter-shelling
  is out of scope for this arm; if the pilot shows the
  late-day guard skipping most eligible returns, that is a
  finding for a counter variant, not a reason to switch
  mechanisms mid-run.

## Eligibility (SEPARATE bars — packcomp's metric review)

Per live return, recorded at return ENTRY (before shelling):

- finishedKcal: haul-block definition (kcalEach > 0 AND NOT
  isUnprocessed), exactly as depositkeep/packcomp.
- shelledNet: sum over in-shell lots of
  units x round((hiddenKcal || kcalEach) x 0.75) — the engine
  formula, computed BEFORE shelling.
- combined = finishedKcal + shelledNet.
- ELIGIBLE (shelling-shaped) return: finishedKcal <= 2,000 AND
  combined > 2,000. On such a return at baseline, unload is 0
  BY ARITHMETIC (the keep swallows the finished pack); only
  shelling can make it unload. This is the ONLY denominator
  for the firing bar.
- HAUL-SIZE-SHAPED seed (descriptive only, never in any
  denominator): a seed whose max combined over ALL its live
  returns is < 2,000. No shelling habit can flip such a seed;
  counting it against the habit would repeat packcomp's
  conflated bar. Reported as a count and a seed list, not
  judged.
- unloadKcal per return: depositPantryPieces kcal inside that
  returnToVillage call (depositkeep bucket rule; donate calls
  counted separately, putAway deposits counted as 'other',
  never as unload).

## Freshness verification (done before writing this prereg)

- Prior bands, from evidence filenames / seed fields / preregs
  dated 2026-11-01: depositkeep + packcomp pilot 51101-51108;
  packcomp live control 51109; depositgate confirm jsonl seed
  fields 51109-51120; dipslide confirm seeds NOT yet chosen
  (its prereg specifies bars only, no band — nothing to avoid
  there beyond the bands above).
- Judged bands below use 514xx, which appears in NO jsonl seed
  field and NO 2026-11-01 prereg band (the 514xx hits in raw
  greps are transcript sequence numbers / kcal figures inside
  corpus text, not seed fields — verified by restricting the
  check to "seed" fields and prereg band statements).
- 51107 is used ONLY as a NON-JUDGED positive control (armed
  leg, proving the habit fires on the known 51107 shape).
  It is never a judged seed and never enters any verdict count.

## Pilot (8 seeds, before/after on identical seeds)

- Pilot band: 51401-51408, baseline + armed, competent, 30d.
- PILOT GO requires ALL THREE (a miss on any prong is NO-GO,
  killed-at-pilot, no confirm spend):
  (i) FIRING: the habit fires on >= 80% of ARMED eligible
      returns. If the armed pilot band has ZERO eligible
      returns, the pilot is UNJUDGED (no test), not GO — the
      arm ends with evidence only and consumes no confirm band.
  (ii) BAND UNLOAD: armed total unload kcal > baseline total
      unload kcal on the pilot band (paired seeds).
  (iii) SHELLING-SHAPED FLIP: >= 1 seed with baseline unload
      total = 0 AND armed unload total > 0, where >= 1 armed
      unloading return on that seed had finishedKcal <= 2,000
      at entry and shelledNet > 0 (i.e. the unload is
      attributable to shelling: with finished <= keep, the
      haul block could only pool shelled food).
- Pilot also reports (descriptive, not judged): haul-size-
  shaped seed count; total lots shelled; total ticks charged
  (must equal 4 x lots, verified against dayTicks deltas on
  the control leg); skip counts by reason; pantry-cap-blocked
  eligible returns (pantry room <= 0 at entry); death causes.

## Confirm (ONLY on pilot GO; 12 fresh seeds)

- Confirm band: 51411-51422, baseline + armed, identical seeds,
  competent, 30d.
- CONFIRM GO requires ALL THREE:
  (a) SHELLING-SHAPED UNLOAD RATE: armed eligible-return
      unload rate >= 80% AND >= 30 percentage points above
      the baseline eligible-return unload rate (baseline is
      0% by construction on eligible returns — the bar is
      stated as a comparison anyway so the judge is explicit,
      not assumed).
  (b) COST GUARDRAIL: median survival (loop days lived,
      capped 30) armed >= 0.8 x baseline median, AND scholar
      starvation deaths (player death tele with cause
      matching /starv/i) armed <= baseline + 2.
  (c) TICK ACCOUNTING REPORTED: total lots, total ticks
      (4 x lots, verified), ticks per eligible return
      distribution, skip counts by reason. A missing tick
      account is a NO-GO on reporting grounds, not a pass.
- A miss on any prong is NO-GO, never re-scored against a
  friendlier metric. Metric doubts go under "metric review"
  for the NEXT run.

## Balanced panel (§15) — applicability declaration

The official balance-panel driver compares lever arms through
its standardized observer/scorecard/cohort rows and its
registry policies. This arm's primary metric is a custom
return-level census (eligible-return firing/unload, tick
accounting) on a driver-wrapped policy layer, not a panel
metric, and its baseline is a freshly run paired leg on
identical seeds rather than a panel cohort. As in
depositkeep/packcomp/dipslide, NO panel compare is fabricated:
the paired before/after tables below ARE the comparison, on
identical seeds. If the coordinator rules otherwise, the
panel run belongs to a follow-up, not a retrofit of this run.

## Sense test (SENSE-TESTING LAW)

Read at least one armed return transcript end to end (the
shelling lines, the keep/unload line, the welcome) and judge
meaning and coherence: does the scholar shelling on the way
home read like a person preparing food, or like a ledger
trick? Report the reading, not just the counts. Corpus:
armed return transcripts for the pilot's flip seed (if any),
else the best eligible return.

## Files (new only, all named *-shelling-b.*)

- Prereg: evidence/2026-11-01/sim-shelling-b-prereg.md (this)
- Policy layer: scripts/policies/shelling-b.js
- Driver: scripts/shelling-b-driver.js (baseline + armed legs,
  per-seed JSON line to stdout, EPERM-flap callback writes)
- Analyzer: scripts/analyze-shelling-b.js (stdin jsonl -> verdict
  tables; pure, no sim)
- Proof test: scripts/test-shelling-b.js (pure checks + live
  determinism/control legs, incl. non-judged 51107 control)
- Evidence: evidence/2026-11-01/sim-shelling-b.md
- Census: evidence/2026-11-01/sim-shelling-b.jsonl (+ confirm
  file if run), corpus: evidence/2026-11-01/sim-shelling-b-corpus/
- NEVER edit any existing policy or script. NEVER touch src/js:
  if the evidence shows a game-code change is required, STOP
  and report that conclusion instead of editing src/js.

## Metric review (for the NEXT run; this run is judged above)

- (Reserved — to be filled from pilot evidence, not now.)
