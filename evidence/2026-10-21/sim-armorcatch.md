# sim-armorcatch — the #735 veteran/armor catch-22 lever (scale-onramp)

Run fleshout-20261022T0019Z, axis scale-onramp. Adopted dead-run tree
(sim-armorcatch, run 2026-10-21T22:25Z coordinator died; worker wrote
policy + proof + sweep + analyze + panel scripts but died before the
sweep). Branch brought to master e7393c86e (sim-w5gates-noseat DIAG-GO),
proof re-verified green post-rebase before any sweep.

## Pre-registration (from the arm brief — binding)

- PRIMARY: armed runs reaching (max-daily armored@P15 >= 4 AND >=1
  villager-attributed wave-4 kill, kill-time, same run) >= 2/16 AND >=
  control+1. GO = PRIMARY met. Miss = NO-GO.
- Guardrails: median survival >= control-10d; villager combat deaths <=
  control x1.2; no new death mode (>=2-event rule); starvation deaths <=
  control+2.
- Horizon: 180d death-aware (reachability lever: waves 4-5, national,
  table, wins — MEASUREMENT §10). Dead villages stop simulating.
- Seeds: 65421-65428 (fresh, verified unused 2026-10-21) x
  {leadfeast, belongfeast} x {control, armorcatch} = 32 configs, paired
  identical seeds.
- Substrate (pinned): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1. Control = VGEAR=1 stack
  (ARMORCATCH unset); armed = ARMORCATCH=1 OUTSIDE the same stack.
- The lever: scripts/policies/armorcatch.js, three beats — (1) chaff
  exposure veto (<0.75 hp, non-wave-4 fights), (2) armor-bearer triage
  line 0.60 in wave-4 fights (unless wave-4 near-death <=0.25), (3) armor
  census (counts only). Zero src/js, default-OFF.
- Kill-time attribution mandatory (backlog): wave kills attributed by the
  bearer <redacted> the kill's day, never end-of-run. The sweep's killdisc-v2
  instrument does this.

## Proof (STEP 1)

FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1
KILLDISC=1 node scripts/test-armorcatch-20261021.js → **24 PASS, 0 FAIL**
(E0 shape, E1 predicate RED->GREEN fixtures, E2 det-gate ARMORCATCH-off
byte-identical to control, E3 RED->GREEN on identical seeds (s64843,
180d), E4 determinism, E5 env-gate exits 2, D2 180d completion). Composition
honesty pinned BEFORE the sweep.

## Pilot sweep (STEP 2) — both arms complete, exit 0

Per-seed JSONs: evidence/2026-10-21/perseed-armorcatch/
(16 control + 16 armorcatch). No instrument errors on any run.

## Analyzer verdict (STEP 3) — NO-GO

node scripts/analyze-armorcatch-20261021.js → VERDICT: NO-GO (exit 3).

| | control | armorcatch | bar |
|---|---|---|---|
| PRIMARY (armoredMax>=4 AND villW4>=1) | **6/16** | **4/16** | >=2/16 AND >= control+1 (7/16) → **NO-GO** |
| median survival | 92d | 96d | >= 82d → PASS |
| villager combat deaths | 413 | 419 | <= 495.6 → PASS |
| starvation deaths | 6 | 6 | <= 8 → PASS |
| new death mode (>=2-event) | — | none | PASS |
| ac counters (veto engagements) | 0 | 16 (15 chaff + 1 triage) | mechanism fired |
| wave-4 villager kills (kill-time) | 7 | 5 | direction: wrong |

Control primaries: leadfeast-s65427, leadfeast-s65428, belongfeast-s65423,
belongfeast-s65424, belongfeast-s65425, belongfeast-s65426.
Armed primaries: leadfeast-armorcatch-s65428, belongfeast-armorcatch-s65424,
belongfeast-armorcatch-s65425, belongfeast-armorcatch-s65426.

Wave-4 villager kills, kill-time attributed: control 7 (Aroha@d62
influencer, Muthu@d66 algorithm, Aria@d74 influencer, Adaeze@d75 strike,
Helga@d173 suburb, Kate@d99 influencer, Ines@d129 congregation) vs armed 5
(the same Muthu@d66, Aria@d74, Helga@d173, Kate@d99, Ines@d129 — the
deterministic seed pairing shows the kills that survived the vetos are the
identical late kills; the early kills Aroha@d62 and Adaeze@d75 were eaten).

## Balanced panel (STEP 4) — review_required, no rescue

scripts/build-armorcatch-panels-20261021.js → evidence/2026-10-21/
armorcatch-panel-primary.md + armorcatch-panel-primary.json(.gz).
compare control->armorcatch: decision=**review_required** on leadfeast
(playerDeaths regression_watch: paired delta +1.375, 95% exploratory
interval [0, 3.875]; per-100-days +0.76 [0, 2.06]), no material signal
elsewhere, belongfeast clean. The panel is the instrument; the
pre-registered PRIMARY is the judge — both agree this arm does not land.
Table win rate / national access: no signal either direction.

## Wall numbers (both arms)

| | control | armorcatch |
|---|---|---|
| national | 11/16 | 11/16 |
| table | 12/16 | 12/16 |
| won | 12/16 | 12/16 |
| wave4 unlocked | 11/16 | 11/16 |
| **wave5 unlocked** | **1/16** | **1/16** (same seed s65428 leadfeast — determinism) |
| exiled | 0 | 0 |
| medSurv / maxSurv | 92d / 181d | 96d / 181d |
| w5vetsMax>=2 | 4/16 | 3/16 |

The #735 bind persists: defer5 re-binds on the veteran bar (2 living
wave-4 killers). The wave-5 door remains shut at 1/16 on this substrate.

## Sense-test (STEP 5) — the disengages read fine; the decisions don't

scripts/sense-armorcatch-20261021.js ran the veto-firing seeds with
narration live; 11 veto events captured with full beat context
(determinism held under narration: same veto counts as the sweep).

Beats around the triage veto (belongfeast-s65423, d79, The Eulogy
956/966, round 2):
```
d79 r2 [The Eulogy(956/966)] | Adaeze's turn
d79 r2 [The Eulogy(956/966)] | Adaeze strikes the Eulogy.
d79 r2 [The Eulogy(945/966)] | Adaeze hits eulogy for 11.
d79 r2 [The Eulogy(945/966)] | The narration stumbles — a page flutters loose from the script.
d79 r2 [The Eulogy(945/966)] | Travel 1 tile to grove.
d79 r2 [The Eulogy(945/966)] | 🚪 BARRIER CROSSED — you crash through to a new area. It can't follow. (You left the fight — it melts back into the wilds.)
d79 r2 [The Eulogy(945/966)] | Adaeze sags with relief. "Good. Good call."
```
The presentation is NOT robotic: the retreat is honest, the engine
narrates it, and companions react with mixed feelings elsewhere
("Violet spits. "Coward's move. Smart, but coward's."" at d60/d62
fights). The retreat reads as a real decision with real social texture.

The DECISION is the problem: the fight was at round 2 against a
full-HP wave-4, the staged fighter was making progress, and the veto
ended the entire encounter for everyone (the scholar's barrier exit
dissolves the fight — there is no per-companion withdrawal verb
policy-side). Control's Adaeze landed the wave-4 kill at d75; the armed
trajectory's d65 chaff veto diverged the timeline first and the d79
triage veto finished the job.

Chaff vetoes (leadfeast-s65427, 9 of them): they fire while fights are
being WON — d62 Elder Gavel at 388/494 with Violet feasted-hitting for
66; d55 Pack-leader The Callback at 25/408 where the disengage turned
into a barrier chase (the monster followed through — "they're right
behind you — through the barrier!") and the fight continued anyway,
costing a turn for nothing. Control leadfeast-s65427: w4=3. Armed:
w4=0.

## Mechanism autopsy (root cause — the kill is CONCEPT-DEAD, §14a)

1. CONTACT VERIFIED: the mechanism fired (16 vetos in 16 runs) in real
   wave-3/wave-4 fights with staged armor-bearers engaged.
2. THE THESIS DIDN'T REPRODUCE ON THIS SUBSTRATE. The #735 bind
   ("filling the veteran bar bled armor 5→0", s64402-leadfeast) was
   measured on an earlier substrate. On the pinned VGEAR=1 substrate,
   control already co-achieves (armoredMax>=4 AND villW4>=1) in 6/16 —
   the armor bar does NOT bleed when kills happen (all six control
   primaries hold armMax 4-8). VGEAR's own survival beat (40% companion
   line, scholar yield, fighter staging) already holds the armor line;
   the armorcatch layer is marginal avoidance on top.
3. THE ONLY POLICY-SIDE DISENGAGE VERB ENDS THE FIGHT. breakOffDisengage
   moves the SCHOLAR through the barrier; the scholar fleeing dissolves
   the entire encounter for everyone. There is no per-companion
   withdrawal verb. So "protect the armor-bearer" is implementable only
   as "abort the fight" — which also aborts the kill-yield pipeline the
   veteran bar needs.
4. THE TRIAGE EXCEPTION IS STRUCTURALLY NEAR-UNREACHABLE. The 60% line
   fires at the first round>=2 check where a bearer <redacted> 0.60; wave-4 fights
   are 4-6 rounds (HP 850-1500), so the near-death (<=25%) "let the kill
   land" clause can almost never be reached before the fight is aborted.
   It fired once in 16 runs.
5. MEASURED: the protection didn't protect. Villager combat deaths 419
   vs 413 (within 2% — no mortality reduction), while wave-4 villager
   kills fell 7→5 and the PRIMARY fell 6/16→4/16 against a bar of 7/16.
   The scholar disengage itself costs lives on leadfeast (panel
   regression_watch +1.375 player deaths/run).

Not METRIC-BROKEN (bar was reachable: control hit 6/16; the pool was the
control-measured co-occurrence; the verb existed; the horizon contained
the wave-4 era). Not SUBSTRATE-MISSING (contact confirmed, wave-4 fights
staged, vetos fired). CONCEPT-DEAD: the mechanism was staged, fired, and
failed on its merits — fight-aborting protection trades away the very
kill-yield the veteran bar requires, and it did not reduce deaths at all.
Per kill discipline (Steve 2026-10-21): the lever is wrong, not the
measurement. Do not retry without a NEW mechanism (kill-preserving
triage — e.g. an in-fight bearer withdrawal verb, which does not exist
policy-side today).

## Findings backlog

- [open] 2026-10-22 — scale-onramp/mechanism — NO PER-COMPANION WITHDRAWAL VERB (flesh-out loop arm sim-armorcatch, run fleshout-20261022T0019Z, evidence/2026-10-21/sim-armorcatch.md, KILLED-AT-PILOT): any future triage/discipline mechanism is blocked on an engine verb that withdraws a single companion from a TB fight without ending the encounter for everyone. Today the only policy-side eject is the scholar's own barrier exit (VG.breakOffDisengage), which dissolves the whole fight — the armorcatch autopsy proved fight-aborting protection costs the veteran bar its kills (7→5 wave-4 villager kills, primary 6/16→4/16, deaths unchanged 419 vs 413). If the engine ever stages a single-fighter retreat, the armor-discipline question re-opens as a new run.
- Companion retreat reactions exist and read well ("Coward's move. Smart, but coward's." / "Good. Good call.") — social texture on flee is working; no backlog item.

## Metric review (§14 — none for this run; held for next)

The PRIMARY held: reachable (control 6/16), fairly scoped to the
catch-22's two bars, measured with kill-time attribution per the backlog
mandate. No re-scoring was considered or performed. For the NEXT run on
this axis: the primary's two conjuncts are measured on different clocks
(armoredMax = max-daily peak; villW4 = kill-time). defer5 needs them
simultaneously alive, so a same-day co-occurrence metric would judge the
bind tighter. This is a proposal for the next run, not a revision of this
one.

## Verdict

**KILLED-AT-PILOT (CONCEPT-DEAD).** Policy layer deleted zero-trace;
instruments + proof + evidence + panels land as the killed-verdict
record. Convergence state: **killed-at-pilot**.

Proof: scripts/test-armorcatch-20261021.js (24/24, post-rebase).
Sweep: scripts/sweep-armorcatch-20261021.js (32 configs, 0 instrument errors).
Analyzer: scripts/analyze-armorcatch-20261021.js (VERDICT: NO-GO).
Panels: scripts/build-armorcatch-panels-20261021.js →
evidence/2026-10-21/armorcatch-panel-primary.md (review_required).
Sense: scripts/sense-armorcatch-20261021.js (11 veto beats captured).

Anchor: master e7393c86e. Branch sim-armorcatch. Merged locally: no —
awaiting coordinator --ff-only merge. Do NOT push/bump.
