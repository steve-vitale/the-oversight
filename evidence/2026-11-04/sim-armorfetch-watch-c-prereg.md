# sim-armorfetch-watch-c — PREREG (binding, committed BEFORE any judged panel run)

Run: oversight-flesh-out-loop (Loop A), run fleshout-20261104T1220Z,
arm sim-armorfetch-watch-c, axis food-economy. Scripts/panel work ONLY:
no game-code change is expected or wanted. Any game-code fix candidate
found is DOCUMENTED in the evidence, never landed here.

## What is being re-checked

The OPEN backlog item from evidence/2026-11-04/sim-stasharmor-a.md and
evidence/2026-10-30/sim-armorfetch-b.md: the armorfetch-b balanced-panel
tier-3+ watch. Armorfetch-b panel compare
(evidence/2026-10-30/sim-armorfetch-b-panel-compare.md, decision
review_required, NO regression_signal) reported, competent policy,
16 paired cases, seeds 16101–16116, 60d:

- Earned player tier-3+ weapon/armor access: 0.5 -> 0.3125,
  regression_watch, paired exploratory interval -0.4375 to 0.0625
  (includes 0).
- Player tier-3+ contest/show weapon/armor: 0.3125 -> 0.125,
  regression_watch, paired exploratory interval -0.375 to 0
  (includes 0).

Per §15 the watch did not override armorfetch-b's GO, and per the
brief this watch does not override any GO either: this arm only
re-measures the two metrics on current master.

## Panel spec (pinned)

- Instrument: scripts/balance-panel.js (current master, same observer).
- Command: `node scripts/balance-panel.js --out
  evidence/2026-11-04/sim-armorfetch-watch-c-panel --seeds
  16101,16102,16103,16104,16105,16106,16107,16108,16109,16110,16111,
  16112,16113,16114,16115,16116 --policies competent --days 60`
- Band: recorder band 16101–16116, horizon 60d, competent policy only
  (the armorfetch-b panel was competent-only; no other policy is
  judged here).
- Output: the panel's panel.json.gz (cases/ cache deleted before
  commit, never committed), plus a small extraction of the two watch
  metrics and wall numbers from the panel rows.
- Watch values carried forward from armorfetch-b's AFTER leg:
  access 0.3125 (5/16), contest/show 0.125 (2/16).

## Spawn state (re-probed BEFORE this prereg, not judged)

scripts/probe-armorfetch-spawn.js on current master, band 16101–16116:
- 16103: bloodplate, torso, P40 (was swat_vest P35 at armorfetch-b
  time) — still exactly one stashed armor piece, still torso, still
  beating the empty slot. Confirms the brief's 1015Z/1120Z note.
- 16109: NO stashed armor (was farstrider_boots shoes P12) —
  confirms the brief's note.
- All other 14 seeds: exactly one stashed armor piece beating the
  empty slot (bark_armor, work_gloves, good_boots, rain_shell,
  running_shoes, flannel_shirt — same families as armorfetch-b).
- NO further spawn drift beyond the two brief-named changes.
- Comparability effect: the panel measures EARNED tier-3+ gear, not
  spawn armor, so the panel population is the same seeds/policies/
  days; the spawn drift is a small starting-gear trajectory change
  (16103 starts P40 instead of P35, 16109 starts with no stashed
  armor instead of P12 boots), disclosed here, not silently ignored.
  The acceptance test (spawn armor fetched/worn in 7 days) is NOT
  re-run by this arm and must not be claimed from this panel.

## DECISION RULE (binding, descriptive — a watch, not a lever)

Judged per metric separately, fresh panel on current master vs the
watch value above. Interval method: Wilson 95% confidence interval
for a single proportion, n = number of observed competent cases
(expected 16). The panel's paired compare against armorfetch-b's
after-panel is NOT the judge: source manifests have moved since
2026-10-30 (sibling landings), so a reused-panel compare would
likely come back INVALID under §15 and must be discarded, not
interpreted, if attempted at all.

- "watch closed, no further regression" = fresh point estimate >=
  the watch value OR the fresh Wilson interval includes the watch
  value, for that metric.
- "regression confirmed" = fresh Wilson interval entirely BELOW the
  watch value for that metric. Only then may it be called a
  regression, and even then NO game change lands here — it is filed
  as a backlog item for a future lever arm.
- If the panel cannot be reproduced on current master (spec
  unrecoverable, pipeline broken), report INSUFFICIENT-DATA with
  exactly what failed — never fabricate a panel compare.

## Wall numbers (descriptive, not gated)

Report for the panel band: wins, national access, table
win/entry/sitting, community loss, and wave reach if the panel rows
carry it (if wave reach is not in the panel instrument, say so —
do not fabricate it from another instrument).

## Metric review

(To be filled at evidence time. Pre-registered metrics bind this run;
a miss is NO-GO, never re-scored against a friendlier metric mid-run.
If a metric proves wrong, the revision is proposed here for the NEXT
run, not applied to this one.)
