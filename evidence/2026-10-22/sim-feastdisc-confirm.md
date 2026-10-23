# sim-feastdisc-confirm — threat-driven armed-feast staging (axis scale-onramp)

Run: fleshout-20261022T1717Z follow-on (flesh-out loop) — confirm of the
sim-feastdiscipline pilot (evidence/2026-10-22/sim-feastdiscipline.md).
Policy files: scripts/policies/feastdiscipline.js (FEASTDISC=1, zero src/js,
read-only for the confirm — NOT modified), scripts/test-feastdiscipline-
20261022.js (re-verified GREEN on this tree before sweeping: 32 PASS, 0
FAIL, 2026-10-22), scripts/test-feastdisc-confirm-20261022.js (confirm
proof gates), scripts/sweep-feastdisc-confirm-20261022.js (confirm sweep,
NEW — pilot's sweep untouched), scripts/build-feastdisc-confirm-panels-
20261022.js (§15 confirm panel builder, NEW).
Anchor: 2cfc6b909 (worktree sim-feastdisc-confirm; 3 commits behind master
tip 5245f3165 — delta is evidence/instrument-only, ZERO src/ changes, so
the sim substrate is byte-identical to master tip. Base offset noted for
the coordinator's --ff-only landing rebase).

## PILOT RECAP (carried, not re-litigated)

Pilot: 8 fresh seeds 66021-66028 x {leadfeast, belongfeast} x
{control, feastdisc} = 32 paired configs, 180d death-aware, on the proven
non-seat long substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1; VETREL/REPOSITION/VGEAR
unset). GO on the kill-time primary (armed 5 vs control 2 villager wave-4
kills, >= control+2 AND >=2/8 seeds). Damage-majority FLAT (armed 0 vs
control 1) — the named honest caveat. Guardrails all pass (median -7.5d,
starvation flat, no new death modes). Sense-tested PASS. Convergence:
converging — mechanism steerable, scholar still closes kills.

## PRE-REGISTRATION (§14 binding — written BEFORE the confirm sweep)

- Design: 12 FRESH seeds (66111-66122, filename-verified 2026-10-22:
  zero filename hits across evidence/ + scripts/, zero script-content
  hits; test-deathcensus-b.js uses 66109/66110 and evidence/2026-10-18/
  perseed-w5preseat uses 66101-66108, both excluded) x {leadfeast,
  belongfeast} x {control, feastdisc} = 48 paired configs, 180d
  death-aware (dead villages stop simulating; the harness breaks on
  Game.over), on the same non-seat long substrate as the pilot:
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 (VETREL/REPOSITION/VGEAR unset).
- control = AD.armedFor(base), ARMORYDRIVE=1 (proven baseline).
- feastdisc = FD.disciplinedFor(AD.armedFor(base)), ARMORYDRIVE=1 +
  FEASTDISC=1 (threat-driven armed-feast staging OUTSIDE the armorydrive
  stack). Zero src/js.
- PRIMARY (mechanism, binding): damage-majority (>=50% of the kill's
  fight damage from non-scholar sources, KILLDISC-attributed) armed
  wave-4 villager kills vs control — GO = armed >= control+2 AND >=3/12
  armed seeds with a damage-majority villager wave-4 kill (seed bar
  scaled honestly from the pilot's >=2/8 = 25%). This is the theory the
  pilot named as the honest caveat: companion CAPABILITY, not
  kill-credit.
- SECONDARY (non-binding, reported): kill-time villager wave-4 kills
  (pilot's primary), feasted-engagement rate, staged-feast volume.
- GUARDRAILS (all binding): median survival >= control-10d (per-seed
  matched); no new death mode (>=2-event rule); starvation deaths <=
  control+3.
- KILL-FAST: if the layer stages zero feasts in the confirm (mechanism
  never fires) — close as evidence, do not advance.
- A miss is NO-GO — never re-scored mid-run (§14). Metric doubts go
  under "metric review" for the next run.
- Instruments: KILLDISC=1 v2 + daily bearer census (kill-time
  attribution) + feast-staging census + FD.tele layer counters.
  Before/after through the balanced panel (scripts/balance-panel.js) per
  §15 — env-gated levers make the automated compare invalid by
  construction (per sim-findings.md); both panels built, §15 status
  noted, manual paired-row comparison attached.

## Confirm proof gates (run BEFORE the sweep — scripts/test-feastdisc-confirm-20261022.js)

- C1 seed-freshness: all 12 seeds absent from evidence/ + scripts/
  filenames and script content (filename criterion — no substring-grep).
- C2 armed determinism: one fresh seed x {leadfeast} x {control, feastdisc},
  60d, same seed twice -> byte-identical sweep JSONs (re-run with
  _rerun suffix, diffed).
- C3 attribution units: kill-time + damage-majority attribution on
  synthetic waveKillLog/KILLDISC rows — RED->GREEN (pre-falsified
  variants must fail).
- C4 metric-computation sanity: paired-row diff aggregation on synthetic
  rows (median, guardrail checks) — RED->GREEN.

RESULT 2026-10-22: **ALL GREEN** (14 PASS, 0 FAIL), on
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
KILLDISC=1 ARMORYDRIVE=1. The confirm sweep ran AFTER these gates.

POST-REBASE RE-VERIFICATION (adoption worker, 2026-10-22, tree ff'd to
master e32d4e8c4): scripts/test-feastdisc-confirm-20261022.js re-run ->
**12 PASS, 2 FAIL**. Both failures are the C1 seed-freshness gates, and
both fail EXCLUSIVELY on this arm's own post-gate outputs, all written
AFTER the gates ran (the sweep ran after the gates; the perseed corpus,
analyzer, panel builder, and sense probes were written after the sweep):
the filename gate trips on the 48 perseed-feastdisc-confirm JSONs
(their names carry the seed tokens by design), and the script-content
gate trips on scripts/analyze-feastdisc-confirm-20261022.js,
scripts/build-feastdisc-confirm-panels-20261022.js,
scripts/sense-feastdisc-confirm-20261022.js, and
scripts/sense2-feastdisc-confirm-20261022.js. Zero filename hits and
zero script-content hits from any OTHER arm's files (a repo-wide check
found only coincidental numeric substrings inside evidence JSON data
blobs, outside the gate's filename/script-content criteria, mostly
predating the sweep). The gate's purpose — seeds fresh relative to
PRIOR work at sweep time — was satisfied and recorded pre-sweep
(14/14); the re-run failures are a re-verification-ordering artifact,
NOT a freshness breach, and the script was deliberately NOT edited to
re-pass (no re-scoring, §14). C2 armed determinism (byte-identical
re-run, the DET claim) PASSES on the new base; C3 attribution units
and C4 metric aggregation PASS unchanged.

## CONFIRM RESULTS (48 configs, 180d death-aware)

Control = AD.armedFor, armed = FD.disciplinedFor, both ARMORYDRIVE=1.
Per-seed corpus: evidence/2026-10-22/perseed-feastdisc-confirm/ (48 JSONs).
Analyzer: scripts/analyze-feastdisc-confirm-20261022.js.

### Primary (damage-majority villager wave-4 kills — binding): GO by the letter

- Control: 1 damage-majority kill on 1/12 seeds (s66121/belongfeast: Mateo
  d83 The Suburb, non-scholar share 0.52).
- Armed: 3 damage-majority kills on 3/12 seeds:
  - s66115/belongfeast: Grace d86 The Audit, share 0.56
  - s66119/belongfeast: Hannah d146 The Congregation, share 0.68
  - s66121/belongfeast: Mateo d83 The Suburb, share 0.52
- Verdict: 3 >= control+2 (3) AND 3/12 seeds >= 3/12. **GO.**
- Honest caveat (read the fine print before celebrating): the s66121
  armed kill is BYTE-IDENTICAL to the control kill (same name, day,
  monster, damage split 679/723). The FD layer staged ZERO feasts on
  that config (feastsStaged=0, beats=6 all skipped) — the two runs were
  identical through d83, and the kill is base-policy behavior the armed
  arm inherited, not a manufactured conjunction. Genuinely
  layer-attributable damage-majority seeds: 2 (s66115, s66119). The
  verdict is intent-to-treat (arms compared as policies, including
  configs where the layer is silent) — GO stands, but the mechanism's
  true manufactured count at confirm scale is 2, not 3.
- The #808 misattribution case appears on the control side and is
  correctly excluded: s66116/belongfeast control had a kill-time villager
  credit (villW4=1) with 0 damage-majority — the damage-majority metric
  withholds credit exactly as the backlog revision intended.

### Secondary

- Kill-time villager wave-4 kills: control 3 (3/24 configs) vs armed 11
  (9/24 configs) — replicates the pilot's 2->5 at larger scale.
- Feasted-engagement rate: control 24/121 (19.8%) vs armed 55/143
  (38.5%) — replicates the pilot's 10%->38% conjunction lift.
- Layer-staged feasts: 90 armed (tele.feastsStaged), 0 control
  (composition honesty: the layer never fires on the control arm).
- Total feasts: 327 armed vs 241 control.
- Mean non-scholar damage share on armed kill-time villager kills: 0.36
  (n=12) — companions contribute a real third of the damage on the
  kills they get credit for, but the scholar still closes most fights.

### Guardrails: ALL PASS

- Median survival: 118.5d armed vs 133.0d control raw; paired per-seed
  matched median diff 0.0d (range -62..+42) — within the >= control-10d
  bar. (The raw-median gap is distribution shape: a few long control
  runs; the binding matched metric is flat.)
- Starvation deaths: 11 armed vs 12 control (<= control+3).
- No new death mode: "a wound that wouldn't close" appears 12/12 on both
  arms; every cause on both arms; no cause >=2 events absent from
  control.

### §15 balanced panel: built, noted, manually judged

- feastdisc-confirm-panel-primary-before/after.json.gz + .md built from
  the confirm corpora (scripts/build-feastdisc-confirm-panels-20261022.js).
- Panel decision: review_required. belongfeast playerDeaths100Days
  regression_signal (delta +3.34/run, ci [0.90, 6.05]); leadfeast
  playerDeaths regression_watch.
- §15 STATUS: the intervention is env-gated (FEASTDISC=1 on the armed
  arm only); per sim-findings.md the automated compare is invalid by
  construction — the manual paired-row comparison is the judging
  instrument (this section).
- Investigation of the panel signal: the panel's "playerDeaths" maps the
  sweep's all-cause `combat` bucket (villagers included), not scholar
  deaths. Manual paired checks: scholar-combat-death diffs median 0.0
  (range -4..+10); villager-combat-death diffs median 0.0 (range
  -13..+28); totals 665 vs 660. The three outliers (belongfeast|66115
  +28, belongfeast|66119 +17, leadfeast|66115 +14) are longer-lived armed
  villages with more fights (66115: armed lived to d108 vs d80, w4kills
  3 vs 0, Grace's dmgMaj Audit kill) — the same busier-fight-calendar
  trade the pilot documented, not a new mortality channel. Guardrails
  (median survival, starvation, new death modes) all pass; no guardrail
  breach.

## DOCUMENTED FINDING — staging volume != conjunction (s66117/leadfeast-armed)

On s66117/leadfeast-armed the layer staged 11 feasts (24 total, all
armed) yet 0/11 wave-4 engagements were feasted. The engagements arrived
as a terminal Eulogy cascade (10 Eulogy fights + 1 Reunion, d124-128,
village died d128) — the feast pipeline can't conjure a buff mid-cascade
(feasts are 1/day, haven-gated, 48 ticks; the layer correctly skips
in-combat). Same shape on s66121/leadfeast-armed: 15 staged, 22 feasts,
10 engagements, only 2 feasted. The mechanism raises the CONJUNCTION
RATE in aggregate (38.5% vs 19.8%) but misses terminal cascades
entirely. A future arm that wants cascade coverage needs a faster
staging path (not a bigger one) — or must accept the miss. Named for
the backlog.

## Sense test (SENSE-TESTING LAW) — PASS (with substrate-drift note)

Completed by the adoption worker post-rebase (the orphan's v1 probe had
diverged from the corpus timeline; v2
scripts/sense2-feastdisc-confirm-20261022.js mirrors the sweep's oneRun
exactly + read-only Game.say wrap, d138-152 narration window on
s66119/belongfeast-feastdisc).

SUBSTRATE DRIFT, documented honestly: the re-run did NOT reproduce the
corpus's d146 Congregation kill. Between the sweep base (2cfc6b909) and
the rebase target (e32d4e8c4) master moved one commit
(journey-establishment r26) touching src/js/ledger.js (9 lines), plus
intermediate commits touching src/js/game.js, encounters.js,
villager-objectives.js — the substrate is no longer byte-identical to
the corpus's. The sense2 timeline is a DIFFERENT but valid run of the
same policy on the new substrate: VERIFY-KILLROWS shows a d76
Congregation damage-majority kill (share 0.56, killTimeVillager=true) —
the mechanism still manufactures damage-majority companion kills, just
on a shifted timeline. The corpus verdict stands on its pre-registered
terms (both arms on one identical substrate at sweep time); sense2 is a
sensibility read, not a re-verdict.

What the narration shows (d138-152), and it is SENSIBLE:
- d141: the layer stages a feast (Srinivas opens the pantry, -1600
  kcal, FEASTED x2.53, devotion x1.5, "Arc IV burns hotter"). A
  scavenger ("The Finale") is drawn by the feast-smell — face it
  feasted or let the watch drive it off. "The Big Big killed Quinn in
  1 round. The village mourns." Valeria's fireside story already grows
  the Priya/Big Big tale — gossip reacting to real events.
- d146: another staged feast, then "The Focus Group" (Pack-leader
  veteran) drawn by the feast. Sigrun and Elena land repeated
  FEASTED-carrying blows ("Sigrun's blow carries the feast"),
  eye-heads-vs-mouth-heads tactics narrated mid-fight, the Pack-leader
  falls, and the SYSTEM televises it: "Elena just put down The Focus
  Group... on CAMERA. That's a veteran kill, folks. REMEMBER the name."
- d150: steeple bell, ABSOLUTION, "The Spool falls", Sigrun's kill
  televised the same way.

Verdict: PASS. The narration reads as one coherent story — staged
feasts draw threats, feasted companions land the killing blows, deaths
are mourned and storied, the show televises the kills. This is the
mechanism the arm claims, visible in prose, not just in census rows.
Nothing robotic, nothing repeated-without-cause (the d150 steeple lines
repeat per-tick as the beam falls — a known narration cadence, not a
bug in this arm's scope).

## Village assessment (plain words)

Villages on the armed stack live ~119 days, reach national 10/24, sit
the table 17/24, and unlock wave 5 on 4/24 (vs 1/24 control) — the
scale-onramp shape moves slightly toward the wall, not away from it.
The fire is busier: 327 feasts vs 241, 90 of them staged by the
threat-driven layer. Companions fight feasted nearly twice as often
(38.5% vs 19.8%) and get kill credit three times as often (11 vs 3) —
and this time the credit is honest: the damage-majority bar withholds
the scholar-carried kills (s66116 control's credit excluded; armed mean
companion share 0.36 on credited kills). The cost is the same honest
trade as the pilot: a busier fight calendar (143 vs 121 engagements)
with the combat deaths that come with it (totals 665 vs 660, paired
medians 0.0). Nobody starves for the fire; nobody dies a new kind of
death. The caveat that survives the confirm: the scholar still closes
most fights — 2 of 3 damage-majority kills were genuinely manufactured,
the third was inherited, and all three sat at 0.52-0.68 share, thin
margins over the bar.

## Metric review (§14)

The damage-majority primary (backlog #808's revision) proved right and
binding: it resolved the kill-credit vs capability disagreement (the
control's s66116 kill-time credit was correctly excluded; the armed
s66121 shared kill is flagged as inherited, not manufactured). Two
revisions proposed for the NEXT run, not applied here: (1) the seed bar
assumes independent armed seeds, but configs where the layer never
fires (feastsStaged=0) inherit the base's kills — consider an
intent-to-treat note as standard, or a secondary "manufactured-only"
count; (2) the 0.5 binary is coarse — the armed kill-time kills' mean
companion share (0.36) carries signal the binary misses; consider
reporting the share distribution as a secondary alongside the bar.

## Wall numbers (scale-onramp)

| arm | national | table | won | wave4 | wave5 | median | max |
|-----|----------|-------|-----|-------|-------|--------|-----|
| control | 8/24 | 16/24 | 0 | 20/24 | 1/24 | 133.0d | 181d |
| feastdisc | 10/24 | 17/24 | 0 | 20/24 | 4/24 | 118.5d | 181d |

maxWave distribution — control: w1=2 w3=2 w4=19 w5=1; armed: w1=2 w3=2
w4=16 w5=4. Top death causes both arms: combat, villager combat,
monster, expedition, sickness, starvation — same shape, no new modes.

## Convergence (scale-onramp axis)

converging — the feast leg of the veterans conjunction is now
policy-steerable AND capability-honest at confirm scale: feasted-
engagement rate 19.8%->38.5%, kill-time kills 3->11, damage-majority
kills 1->3 (2 genuinely manufactured), GO by the letter on the #808
revised primary. Not converged: the scholar still closes most fights
(armed kill-time kills' mean companion share 0.36); the devotion-arming
cadence stays the binding constraint on staged volume
(skippedUnarmed 11-24 on heavy configs); terminal cascades miss the
conjunction entirely (s66117). Named next: the arming-cadence blank and
the cascade-coverage question; no new lever required before the next
evidence pass.

## Files

- scripts/sweep-feastdisc-confirm-20261022.js — confirm sweep (NEW; pilot's untouched)
- scripts/test-feastdisc-confirm-20261022.js — confirm proof gates (NEW; 14/14 GREEN)
- scripts/build-feastdisc-confirm-panels-20261022.js — §15 confirm panel builder (NEW)
- scripts/analyze-feastdisc-confirm-20261022.js — paired before/after analyzer (NEW)
- scripts/sense-feastdisc-confirm-20261022.js — sense probe (NEW)
- evidence/2026-10-22/perseed-feastdisc-confirm/ — confirm corpus (48 configs)
- evidence/2026-10-22/feastdisc-confirm-panel-primary.{json,md} + -before/-after.json.gz
- scripts/policies/feastdiscipline.js — the layer (FEASTDISC=1, zero src/js, UNCHANGED)
