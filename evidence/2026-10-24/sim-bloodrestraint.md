# sim-bloodrestraint — mantle-restraint for blooded vids (axis scale-onramp)

Run: fleshout-20261024T0215Z, arm sim-bloodrestraint (loop oversight-flesh-out-loop).
Backlog: sim-findings #837 (claimed by this run) — the vetretention-restage
named next #1: "Mantle-restraint for blooded vids (game-side)... The next
run belongs to the restraint." (evidence/2026-10-23/sim-vetretention-restage.md)

## Canon read
docs/CANON.md (full), docs/MONSTER-WAVES.md (wave law; waveKillLog as the
veterans-bar source in standing.js). No canon doc covers succession / the
office / the mantle — stated, not invented.

## The surface
The defer5 gate (standing.js villageStandingTotal) needs 2 LIVING wave-4+
killers. The vetretention-restage census (32 configs, 65511–65518 band)
measured 13/18 blooded vids dying as MANTLE-HOLDERS within 14d of their
first kill — the chair, not the fight, eats the veterans. Formation is
PROVEN (sim-vetformation, VETFORMATION=1 landed, 10 vs 6 distinct killers);
retention is PROVEN-but-scope-starved. The restraint attacks the chair:
succession no longer funnels blooded vids straight into the office while
they are still blood-warm.

## The lever
Game-side candidacy hook in src/js/ledger.js playerDeath: when
BLOODRESTRAINT=1, succession skips vids who scored a wave-4+ kill within
the last 14 days (in-window blooded, read from the same state.waveKillLog
the defer5 bar reads — the restraint and the bar agree on who is blooded).
If every candidate is in-window, candidacy falls back to the normal trust
list — a scholar is ALWAYS picked; the mantle never deadlocks. Env-gated,
default OFF (clean control). Voiced ONLY when the restraint changes the
pick: "The village looks to X — but X is still blood-warm from the kill.
'Not the office,' somebody says. 'Not yet. Let them come home first.' Y
takes the journal instead." — people-plausible, knowledge-gated (the
village saw the kill). Feel change -> commit carries [needs-eyes].
Namespace bloodrestraint-* throughout; zero overlap with the sibling
sim-wallseg arm (wallseg-*).

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)
- BINDING QUESTION: does holding in-window blooded vids out of succession
  reduce blooded-vid deaths as mantle-holders?
- PRIMARY (binding): blooded-vid 14d-window deaths AS MANTLE-HOLDER, summed
  over configs (analyzer scripts/bloodrestraint-analyze.js: first-kill
  index, window [firstKill, firstKill+14], death inside the window with
  the player flag set; incomplete windows with no death excluded).
  GO iff armed <= control - 2. A miss is NO-GO, never re-scored.
- SECONDARY: defer5 2-living-veteran coincidence days (armed > control),
  distinct living veteran vids, wall numbers
  (national/table/wins/wave4/wave5/median survival).
- ENGAGEMENT (reported): brEvents rows on armed (the restraint's census
  record, written when it changes a pick); expect 0 on control.
- GUARDRAILS: median survival paired diff >= -10d; succession never
  deadlocks (every brEvent row carries a picked id; no armed
  village-lost pair-loss); no new death-cause strings (>=2-event rule);
  starvation deaths not worse than control (armed <= control+2).
- SEEDS: 65511–65518 (the re-stage's richest formation band) x
  {leadfeast, belongfeast} x {control, armed} = 32 configs, paired
  identical seeds. 180d death-aware (kills happen late; the 14d window
  needs room). Dead villages stop simulating (+10d tail max).
- SUBSTRATE (pinned BOTH arms; the restraint is the ONLY delta):
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1.
  control = VF.formedFor(base), BLOODRESTRAINT unset.
  armed   = VF.formedFor(base), BLOODRESTRAINT=1.
- PILOT: the 32-config sweep IS the pilot (8 seeds). Confirm (12–16
  fresh seeds) ONLY if pilot GO.
- §15: before/after through scripts/balance-panel.js — the panel is the
  instrument, the bars above are the judge.
- METRIC REVIEW section mandatory (below).

## Proof (ALL GREEN before the sweep — 27/27)
scripts/test-bloodrestraint.js (child worker scripts/bloodrestraint-e2e.js,
real Game via sim-harness, real playerDeath with synthetic trust/kill log):
- E0: bloodrestraintBlooded on Game + wired from playerDeath
  (check-wired), ontology provides updated, no empty catch in new code.
- E1: set semantics — in-window wave-4/5 held; lapsed, boundary d=now-15,
  wave-3, future-day, missing-by, empty/missing log all not held.
- E2: env OFF = byte-identical to pristine HEAD (ledger change stashed,
  full said-stream digest match) + determinism (same run twice).
- E3: ON skips the in-window blooded trust-favorite (next trust rank
  picked), the hold-back beat fires, deterministic.
- E4: all-blooded fallback — trust favorite picked, no deadlock, no beat.
- E5/E6: lapsed window / wave-3 kill — restraint does not fire.
- E7: BLOODRESTRAINT='0'/'' behave as OFF.

## Sense verdict (SENSE-TESTING LAW) — PASS

Real firing, scripts/bloodrestraint-e2e.js (real Game.playerDeath, real
village state; the sweep's two wild firings on s65513 are census rows, not
transcripts — the e2e replays the same code path):

> The village looks to Caitlin — but Caitlin is still blood-warm from the
> kill. "Not the office," somebody says. "Not yet. Let them come home
> first." Jose takes the journal instead.

Judgment: it reads as people. The village collectively overrules its own
trust order out of care, not procedure — "blood-warm" is visceral and
honest about what just happened (a wave-4 kill five days ago), and "let
them come home first" frames the office as a burden to be spared, not a
prize to be awarded, which matches the game's "the office is the village's"
fiction. The unnamed "somebody" matches the game's choral voice (the
village speaks as somebody). Knowledge-gated: the village saw the kill
(its own waveKillLog), and the beat fires only when the restraint changes
the pick — never noise. One honest edge: the held vid doesn't get a say,
but that IS the restraint (the village decides). PASS.

## Results

PILOT (32 configs): **NO-GO on the binding primary.**

- PRIMARY: window-mantle-deaths control 1 vs armed 0; bar armed <=
  control-2 -> NO-GO. The bar needed >=2 control deaths; the substrate
  produced exactly 1 (elif_demir, s65513 belong, firstKill d134, died as
  mantle-holder d148).
- The mechanism's signature in that single pair: on armed, the restraint
  fired TWICE on d148 (held elif_demir, picked mateo_alvarez; then held
  elif_demir again, picked james_okonkwo — brEvents rows). elif_demir
  died d161, outside the window, as a fighter — the window-mantle-death
  disappeared exactly where the restraint fired. One observation is not a
  measurement: recorded, not scored (§14).
- SECONDARY: coincidence days 14/14 (no gain); distinct living veterans
  1/1 (no gain). Formation was too thin for the defer5 lens to move.
- ENGAGEMENT: brEvents control 0 (expect 0) / armed 2, both on
  armed-belongfeast-s65513. The restraint fired nowhere else in 16 armed
  configs — little blood, few successions of the trust-favorite.
- Clean-control proof in the wild: armed-lead is BYTE-IDENTICAL to
  control-lead on all 8 seeds (same kills, deaths, days) — with 0
  restraint firings, the env-gated code changes nothing. The OFF path is
  inert by construction AND by measurement.
- GUARDRAILS: all PASS — survival paired-diff median 0d; starvation 21/21;
  no new death kinds; deadlock guardrail PASS (every brEvent row carries
  a picked id; no armed village-lost pair-loss).
- WALL: control national 6/16 table 13/16 won 0/16 wave4 13/16 wave5 1/16
  medSurv 127.5 | armed 5/16 13/16 0/16 13/16 1/16 127.5. The wall stands;
  the single national delta is one config of noise.
- §15 panel: review_required, national regression_watch (delta -0.125,
  ci [-0.375, 0] — the same single config). No broad-balance footprint.
  The instrument is quiet; the pre-registered bar is the judge: NO-GO.
- Telemetry check: LOUD table 16->26, wins 16->0 vs the scale-wall
  baseline — REGIME ARTIFACT (baseline predates the current substrate;
  the re-stage's corpus was already wins 0/32). control==armed on all
  four metrics, so the restraint explains none of it. Baseline NOT
  rolled forward.

No confirm: the pilot is NO-GO, so per the pre-registration there is no
12–16-seed confirm spend.

## Village assessment

The villages on this substrate are villages where little blood flows:
11 wave-4 kills across 32 configs, 5–6 distinct blooded vids (vs 10 on
the re-stage's VETRESTAGE band). Scholars churn through combat deaths —
s65513 buried eight scholars in 161 days. The restraint's one wild story
is d148 on s65513 belong: a combat meat-grinder (three scholar deaths in
two days). The village held elif_demir back twice — and spent mateo_alvarez
and james_okonkwo instead, both dead within a day. elif_demir lived 13
more days as a fighter and died d161 in the wild. The chair didn't take
them; the wild did, later, on the fighter's terms.

Who thrived: nobody in particular — this was a thin-blood band.
Who died and why: elif_demir (blooded d134, held d148, dead d161 combat);
mateo_alvarez (blooded d117, restraint-picked scholar d148, dead the same
day in combat); ruth_goldstein (blooded d93/d110, scholar later, dead d167
combat). The restraint's observed cost: the picked successor inherits the
crisis the blooded vid was spared — a future arm should watch whether the
restraint trades chair deaths for picked-successor deaths.

The blank this run fills: (a) the game-side hook is BUILT and proven
(27/27 proof gates green, mechanism demonstrated in the wild with the
elif_demir pair); (b) the measurement needs a formation-rich substrate —
this run's pinned stack formed too little blood to judge the bar. The
next restraint run belongs on the re-stage's VETRESTAGE band, where the
blood actually flows.

## Metric review (§14)

1. The PRIMARY bar (armed <= control-2) assumed >=2 control
   window-mantle-deaths. The substrate produced exactly 1 — the bar was
   unreachable by construction. This is a pre-registration miss on the
   SUBSTRATE, not the mechanism: the re-stage's 13/18 figure came from
   the VETRESTAGE stack; this run's pinned substrate (+VETFORMATION=1
   +ARMORVILLAGE=1, -VETRESTAGE, per the claim) formed 11 wave-4 kills in
   32 configs. Next run: pre-register the bar conditional on a formation
   floor (>=4 control window-mantle-deaths, else NO-GO-thin), or run the
   restraint on the re-stage's exact substrate.
2. The armed-lead/control-lead byte-identity (8/8 seeds) is the cleanest
   control this loop has measured: 0 firings -> identical trajectories.
3. The elif_demir pair is the mechanism's signature in one observation
   (control window-mantle-death d148; armed held twice, died d161
   outside the window). Recorded, not scored.
4. §15: review_required + single-config national regression_watch; the
   instrument sees no broad footprint, the bar says NO-GO.
5. Telemetry LOUD lines are regime artifacts (see Results); baseline not
   rolled forward.
6. One unreproduced single-flake in the e2e harness (1/35 runs picked the
   trust favorite with BLOODRESTRAINT=1; 20/20 + 8/8 + 4/4 + 27/27
   otherwise, BRDIAG confirms the held set is computed deterministically).
   Documented as a transient, not a mechanism defect.

## Convergence note

- Axis scale-onramp: still CONVERGING (not converged). The veterans leg
  now reads: formation PROVEN (vetformation), retention PROVEN-but-
  scope-starved (vetretention-restage), restraint BUILT and MECHANICALLY
  PROVEN (27/27 proof + wild elif_demir pair) but UNMEASURED — the pilot
  was NO-GO on a thin formation substrate, not on the mechanism.
- Named next: re-run the restraint on the formation-rich re-stage band
  (the VETRESTAGE substrate where 13/18 blooded vids died as
  mantle-holders), with a formation-conditional primary bar; watch the
  picked-successor cost (does the restraint trade chair deaths for
  crisis deaths of the replacement?).
- The scale wall stands (wins 0/32 both arms — structural on this
  substrate; national 6/16 vs 5/16 on noise).

## Instruments (namespace bloodrestraint)
- src/js/ledger.js — bloodrestraintBlooded(day) + the playerDeath
  candidacy hook (BLOODRESTRAINT=1, default OFF)
- scripts/test-bloodrestraint.js — proof (27/27 GREEN)
- scripts/bloodrestraint-e2e.js — proof child worker
- scripts/bloodrestraint-sweep.js — the 32-config census (pinned
  substrate env guard, direct waveKillLog + windowstay death capture +
  bloodrestraintEvents)
- scripts/bloodrestraint-analyze.js — the judge (window-mantle-death
  join, coincidence days, engagement, guardrails, wall)
- evidence/2026-10-24/perseed-bloodrestraint/ — the corpus (32 files)
- evidence/2026-10-24/bloodrestraint-analysis.json — the join output
- evidence/2026-10-24/sim-bloodrestraint.md — this file

Anchor: [FILLED AT LAND TIME]
