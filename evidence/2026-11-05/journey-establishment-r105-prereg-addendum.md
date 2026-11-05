# Journey leg ESTABLISHMENT — r105 prereg ADDENDUM (2026-11-05, Lane A)

## M0 reference correction (written after the pilot seed, before scoring
## seeds 1502–1504; the pilot's data is unchanged, only the reference moves)

The prereg's M0 says r105 must reproduce the r104 PANEL exactly. That
reference is stale: r104's panel ran on master 6b516a7ea, and 63 commits
landed between 6b516a7ea and this run's base (fc8390511) — including r104's
own patient_aim fix (fieldFights.js vHpRoundStart), the tbretreat pilot +
NO-GO revert, vetrest, enddaybeats, and social-life r141 (haven-news
relay). The pilot (seed 1501) shows it: r105 ends day 24, game over,
pantry 0 — against r104's day 43 / pantry 46221.

## Control (the corrected M0 reference)

The r104 DRIVER (unmodified, no r105 wraps) was re-run on the CURRENT base
(fc8390511) as the control, into
`goal hidden_files/evidence-2026-11-05-control-r104/` (EVID override;
the committed r104 panel files were not touched). Seed 1501 control:
endDay=24, over=true, aliveEnd=8, deaths=15, pantryEnd=0, craftLog=0,
npcCraftCalls=24, contests 3/1, skills=91 — IDENTICAL to the r105 pilot
on every summary field, and byte-identical on daily, deaths, skillRows,
teleTypes, census, holdingsEnd, contestCounts, matTrace, and all 623
teleAll rows.

## Corrected M0

M0 is judged against the r104-driver CONTROL on fc8390511 (same seeds,
same code, the wraps the only change) — not against the stale r104 panel.
The analyzer takes the control dir via `R105_CONTROL_DIR`. The stale-panel
comparison is still printed for the record (as "vs r104-panel") but does
not gate the run.

## Standing consequence (for the metric review)

Every future establishment run must re-baseline M0 against a same-base
control when master has moved since the last panel — a panel-to-panel
comparison across a moved base is not an instrument check. The pilot also
surfaces a game finding, not an instrument finding: on the current base,
seed 1501's village wipes at day 24 with ZERO hunt-duty and ZERO cook-duty
resolutions in 24 days (huntLog=0, cookLog=0) and a monotonically declining
pantry. Whether NPC duties ever fire on this base is now an open question
for the panel (seeds 1502–1504) and the run note.
