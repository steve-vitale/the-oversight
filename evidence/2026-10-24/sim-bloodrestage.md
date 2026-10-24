# sim-bloodrestage — mantle-restraint RE-STAGE on the formation-rich band (axis scale-onramp)

Arm: sim-bloodrestage (loop oversight-flesh-out-loop). Executes the named next
from evidence/2026-10-24/sim-bloodrestraint.md: re-run the BLOODRESTRAINT hook
on the VETRESTAGE band where blood flows, with a formation-conditional bar.

## Canon read
docs/CANON.md (full). No canon doc covers succession / the office / the mantle
— stated, not invented (per evidence/2026-10-24/sim-bloodrestraint.md).

## The surface
The defer5 gate (standing.js villageStandingTotal) needs 2 LIVING wave-4+
killers. The vetretention-restage census (32 configs, 65511–65518 band)
measured 13/18 blooded vids dying as MANTLE-HOLDERS within 14d of their first
kill — the chair, not the fight, eats the veterans. The pilot
(sim-bloodrestraint) was NO-GO on a substrate-misspecified bar: the pinned
stack (+VETFORMATION=1 +ARMORVILLAGE=1) formed too little blood (11 wave-4
kills, exactly 1 control window-mantle-death; the bar armed<=control-2 was
unreachable by construction). The mechanism is PROVEN (restraint fired 2x in
the wild; the elif_demir d148 control window-mantle-death became a d161
post-window fighter death on armed where the restraint fired; armed-lead
byte-identical to control-lead 8/8). Per KILL DISCIPLINE the lever is NOT
dead — the miss was base-rate-limited, and the hook LANDED as an instrument
(db7c5f211, default OFF, [needs-eyes]). This arm re-stages on the band where
the blood actually flows.

## The lever (ZERO new src/js — game-side hook ALREADY LANDED)
src/js/ledger.js playerDeath candidacy hook (landed db7c5f211): when
BLOODRESTRAINT=1, succession skips vids who scored a wave-4+ kill within the
last 14 days (same state.waveKillLog the defer5 bar reads — restraint and bar
agree on who is blooded). All-blooded candidacy falls back to the normal
trust list — a scholar is ALWAYS picked. Env-gated, default OFF. Voiced ONLY
when the pick changes: "The village looks to X — but X is still blood-warm
from the kill. 'Not the office,' somebody says. 'Not yet. Let them come
home first.' Y takes the journal instead."

## PRE-REGISTRATION (§14 binding — written BEFORE any sims, 2026-10-24)
- BINDING QUESTION: on the formation-rich band, does holding in-window
  blooded vids out of succession reduce blooded-vid deaths as mantle-holders?
- PRIMARY (binding): blooded-vid 14d-window deaths AS MANTLE-HOLDER, summed
  over configs (analyzer scripts/br-rst-analyze.js: first-kill index, window
  [firstKill, firstKill+14], death inside the window with the player flag
  set; incomplete windows with no death excluded — the pilot's definition).
  Formation-conditional bar: **GO iff control >= 3 window-mantle-deaths AND
  armed <= control-2**. The formation floor is part of the bar: control < 3
  means the band is not rich enough and the verdict is **NO-GO (metric miss,
  not a kill)**. A miss is NO-GO, never re-scored.
- SECONDARY: defer5 2-living-veteran coincidence days (armed > control),
  distinct living veteran vids, wall numbers (national/table/wins/wave4/
  wave5, median survival).
- ENGAGEMENT (reported): brEvents rows on armed, expect 0 on control.
- GUARDRAILS: median survival paired diff >= -10d; succession never
  deadlocks (every brEvent carries a picked id; no armed village-lost
  pair-loss); no new death-cause strings (>=2-event rule); starvation <=
  control+2.
- WATCH (the pilot's observed cost): picked-successor survival — the
  d148 mateo_alvarez/james_okonkwo pair suggests the restraint may trade
  chair deaths for crisis deaths of the replacement. Analyzer reports
  lived-days-after-pick for every armed brEvent.
- SEEDS: 65511–65518 x {leadfeast, belongfeast} x {control, armed} =
  32 configs, paired identical seeds, 180d death-aware (the 14d window
  needs room; dead villages stop, +10d tail max).
- SUBSTRATE (pinned BOTH arms — the vetretention-restage CONTROL stack):
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1; VETRESTAGE/VETFORMATION/ARMORVILLAGE unset.
  control = VS.substrateFor(base), BLOODRESTRAINT unset.
  armed   = VS.substrateFor(base), BLOODRESTRAINT=1.
  The restraint is the ONLY delta.
- PILOT: the 32-config sweep IS the pilot. Confirm (12–16 fresh seeds)
  ONLY if pilot GO.
- §15: before/after through scripts/balance-panel.js
  (scripts/build-br-rst-panels.js) — the panel is the instrument, the
  bars above are the judge.
- METRIC REVIEW section mandatory (below).

## Proof (ALL GREEN before the sweep — 30/30)
scripts/test-br-rst.js (br-rst-e2e.js, real Game via sim-harness, real
playerDeath with synthetic trust/kill log) on the re-stage substrate:
- E0 shape/wiring (4/4), E1 set semantics (10/10: in-window/boundary
  d-14 held, d-15 lapsed, wave-3/5, future/missing/empty log),
- E2 env OFF = byte-identical to the hook-free ancestor ledger
  (git show 3719cfc79 — the db7c5f211 restore diff is exactly the
  +69-line hook; no stash dance: the hook is committed and the stash
  list is repo-global, so stash push/pop is a foreign-stash hazard),
  OFF determinism,
- E3 ON skips the blooded trust-favorite + the hold-back beat voiced,
  deterministic; E4 all-blooded fallback (trust favorite, no deadlock,
  no beat); E5 lapsed window no fire; E6 wave-3 no fire; E7 '0'/'' == OFF.
- Infra note: the FIRST proof run hit the PHANTOM UNMERGED INDEX
  (AGENTS.md 2026-10-24): 7 src/data/*.json files developed UU entries
  with <<<<<<< Updated upstream markers. Tip blobs verified clean
  (branch tips are the source of truth); repaired with
  `git reset --mixed HEAD` + `git checkout -- src/data/` in THIS
  worktree only (main tree and other lanes' trees untouched). Data
  JSONs then parsed, proof green on re-run. Also: the predecessor's E2
  stash-dance is UNSAFE on a committed-hook tree (pop targets the
  repo-global stack's top entry — a foreign WIP); replaced with the
  ancestor-ledger byte check above.

## Results

PILOT (32 configs): **NO-GO on the binding primary — mechanism-scoped, not
base-rate-limited.**

- PRIMARY: window-mantle-deaths control 3 vs armed 3; formation floor
  control>=3 MET (exactly 3), bar armed <= control-2 -> NO-GO. The floor
  was pre-registered for exactly this: the band produced enough control
  events to judge the bar, and the lever failed it (delta 0).
- The three control window-mantle-deaths (all leadfeast):
  - s65513 gen_8mdijoz: firstKill d108, died d121 as mantle-holder.
    Became scholar ~d99 (after mateo_alvarez died d99) — ALREADY the
    scholar at kill time.
  - s65514 sofia_chen: firstKill d170, died d180 as mantle-holder.
    Became scholar d150 (after valeria_quispe died of dehydration) —
    ALREADY the scholar at kill time.
  - s65517 gen_mcowb5v: firstKill d126, died d129 as mantle-holder.
    Became scholar ~d74 (after ruby_callaghan died d74) — ALREADY the
    scholar at kill time.
  **3/3 were already scholars when they killed.** The restraint filters
  succession CANDIDATES — it can never fire for a vid who is already the
  scholar. Its addressable population on this band is measured at ~zero.
- The restraint fired exactly ONCE in 32 configs (armed-leadfeast-s65517,
  d131): a combat meat-grinder had killed three scholars in one day
  (emma_larsen, aroha_ngata, boris_kowalski all d131). The trust-favorite
  was gen_y1ietd2 (blooded d126, in-window) — held; amina_diallo picked
  instead. amina_diallo died as scholar d132 (+1d), in the same crisis;
  the village died out d132. The restraint traded a blooded-vid chair
  death for a picked-successor chair death. Combined with the pilot
  (mateo_alvarez d148, james_okonkwo d149 — both dead within a day of
  being restraint-picked): 3/3 restraint-picked successors dead within a
  day, all in the crisis the blooded vid was spared.
- Armed's blooded rows are otherwise identical to control's (same three
  window-mantle-deaths, same days) — with 1 firing, the env-gated code
  changed nothing else. OFF-inertness extended: armed-lead trajectory
  counters byte-match control-lead on all 8 seeds.
- SECONDARY: coincidence days 3/3 (no gain); distinct living veterans
  control 2 / armed 3 (noise).
- ENGAGEMENT: brEvents control 0 (expect 0) / armed 1 (leadfeast-s65517
  d131, held gen_y1ietd2, picked amina_diallo).
- GUARDRAILS: all PASS — survival paired-diff median 0d; starvation
  20/20; no new death kinds; deadlock guardrail PASS (the single brEvent
  carries a picked id; no armed village-lost pair-loss beyond control's).
- WALL: control national 7/16 table 13/16 won 0/16 wave4 13/16 wave5 1/16
  medSurv 141 | armed 7/16 13/16 0/16 13/16 1/16 141. The wall stands;
  the restraint moves nothing at village scale.
- §15 panel: review_required, no material signals (0 paired deltas on
  every observed metric) — the instrument is quiet; the pre-registered
  bar is the judge: NO-GO.
- Anchor 84d390816755 on all 32 configs — no base drift within the run.
- Substrate note: the re-stage's env stack on current master formed ~9
  distinct blooded vids across 16 control configs (vs 10 at anchor
  e9bce3b685e9) — formation reproduced; the difference is death timing
  (3 control window-mantle-deaths vs the re-stage's 7). The formation
  floor handled this honestly: it was MET.

## Sense verdict (SENSE-TESTING LAW) — PASS, with the story that kills it

The wild firing has no transcript (sweep ran quietLog), so the sense read
replays the same code path (br-rst-e2e 'topblooded', BLOODRESTRAINT=1):

> The village looks to Caitlin — but Caitlin is still blood-warm from the
> kill. "Not the office," somebody says. "Not yet. Let them come home
> first." Jose takes the journal instead.

Judgment: it still reads as people (the pilot's verdict stands) — the
village collectively overrules its own trust order out of care. What this
run adds is the CONSEQUENCE the numbers measured: on s65517 the village
said exactly this about gen_y1ietd2 on d131 — and amina_diallo, who
"took the journal instead," died as scholar the next day in the same
meat-grinder, and the village died out the day after. The beat is honest
about the village's intent and blind to the outcome: holding the blooded
back doesn't make the office survivable; it just chooses who the office
eats. The fiction is coherent; the mechanism's theory of change is what
failed. PASS on the voice, NO-GO on the lever.

## Village assessment

The villages on the re-stage band at current master are villages where
the chair churns through crises. Wave-4 kills still form (9 distinct
blooded vids across 16 control configs), but the blooded are mostly
scholars already: the three window-mantle-deaths all held the office
BEFORE their kills. The one succession the restraint touched (s65517
d131) happened inside a combat meat-grinder that had already eaten
three scholars that day — the restraint's pick died with them.

Who thrived: nobody in particular — this band is a chair-churn band.
Who died and why: gen_8mdijoz (blooded d108 as scholar, dead d121
combat); sofia_chen (blooded d170 as scholar, dead d180 combat);
gen_mcowb5v (blooded d126 as scholar, dead d129 combat); amina_diallo
(restraint-picked d131, dead d132 combat — the lever's cost, 3/3 across
both runs); ruby_callaghan (d74, the succession that made gen_mcowb5v
scholar 52 days before the kill that made them blooded).

The blank this run fills: the restraint's addressable population is
measured, not theorized — a succession filter cannot reach vids who are
already scholars at kill time (3/3 here), and when it does fire it
hands the office's crisis to the replacement (3/3 picked successors
dead within a day across both runs). The veterans leg's binding
constraint is the CHAIR DURING CRISIS, not succession candidacy — the
mantlechain DIAG's named next (new-scholar restraint window: a fresh
successor does not lead wave-4 parties) is the surviving candidate.

## Metric review (§14)

1. The formation-conditional bar worked as designed: the floor (control
   >= 3) was MET (exactly 3), so the NO-GO is a measurement, not a
   thin-substrate miss. The pilot's lesson (bar unreachable by
   construction) is fixed by the floor; this run's NO-GO is earned.
2. The PRIMARY definition (pilot's: first-kill index, player-flag join,
   incomplete excluded) classified all rows cleanly; the armed/control
   row identity (same 3 window-mantle-deaths, same days) is the
   strongest OFF-inertness signal this loop has measured.
3. The picked-successor watch (new this run) paid off: 1/1 armed brEvent
   picked a successor who died +1d — confirming the pilot's 2/2 signal
   (3/3 across both runs). Pre-registering the cost watch was correct.
4. §15: review_required, zero paired deltas — the panel confirms the
   restraint is balance-neutral at village scale; the bar (not the
   panel) judges, and it says NO-GO.
5. Substrate drift note: the identical env stack forms slightly fewer
   window-mantle-deaths at current master than at the re-stage's anchor
   (3 vs 7 on control) — death-timing variance, not formation failure.
   The floor absorbed it. Future re-stages should keep a formation
   floor, not a fixed count expectation.

## Convergence note

- Arm sim-bloodrestage: **killed-at-pilot** (per KILL DISCIPLINE, with the
  root cause named — this is NOT a thin miss). The pilot's NO-GO was
  base-rate-limited (control 1, bar unreachable) so the hook was
  restored as an instrument; this re-stage's NO-GO is mechanism-scoped:
  (a) 3/3 window-mantle-deaths were already-scholars-at-kill, outside a
  succession filter's addressable set by construction; (b) the single
  wild firing traded the death to the picked successor (3/3 picked
  successors dead within a day across both runs). The lever's theory of
  change (keep blooded vids out of the office) fails because the chair's
  mortality falls on whoever holds it during a crisis, blooded or not.
- Axis scale-onramp: still CONVERGING. The veterans leg now reads:
  formation PROVEN (vetformation), retention PROVEN-but-scope-starved
  (vetretention-restage), restraint BUILT, MECHANICALLY PROVEN, and now
  MEASURED-AS-SCOPE-WRONG (this run). The surviving candidates are the
  mantlechain DIAG's named nexts: the new-scholar restraint window
  (a fresh successor does not lead wave-4 parties) and the scholar's
  haven defense (sim-havencontact steve-call).
- Recommendation to the coordinator: revert the landed hook
  (db7c5f211) to zero src/js trace per the kill — the instrument's
  justification (a base-rate-limited miss) is spent. This arm makes
  ZERO src/js changes; the revert is the coordinator's call on the hot
  tree. No confirm (pilot NO-GO).

## Instruments (namespace br-rst)
- src/js/ledger.js — the LANDED hook (db7c5f211; zero new src/js this arm)
- scripts/test-br-rst.js — proof (30/30 GREEN)
- scripts/br-rst-e2e.js — proof child worker (br-rst namespace copy)
- scripts/sweep-br-rst.js — the 32-config census (re-stage substrate env
  guard, direct waveKillLog + windowstay death capture +
  bloodrestraintEvents)
- scripts/br-rst-analyze.js — the judge (formation-conditional primary,
  coincidence, engagement, guardrails, wall, picked-successor watch)
- scripts/build-br-rst-panels.js — §15 balanced-panel compare
- evidence/2026-10-24/perseed-br-rst/ — the corpus (32 files)
- evidence/2026-10-24/br-rst-analysis.json — the join output
- evidence/2026-10-24/sim-bloodrestage.md — this file
