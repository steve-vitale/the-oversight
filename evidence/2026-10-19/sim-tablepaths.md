# sim-tablepaths — path-forcing table driver (flesh-out loop, 2026-10-19, ARM sim-tablepaths)

Run: fleshout-20261019T2226Z, arm sim-tablepaths. Axis: scale-onramp (the blocking axis).
POLICY-SIDE DIAGNOSTIC — zero src/js changes. Instruments + evidence only.
File scope (zero overlap with sibling arms): scripts/policies/tablepaths.js
(new), scripts/*tablepaths*, scripts/test-tablepaths-20261019.js,
evidence/2026-10-19/sim-tablepaths.md + evidence/2026-10-19/perseed-tablepaths/
+ evidence/2026-10-19/tablepaths-panel* + evidence/2026-10-19/tablepaths-transcripts/.

Canon: docs/CANON.md + docs/TABLE.md (the table prices the run, 7 paths each
its own played challenge, failure resolves never wipes, light/dark branches
earned through play never a menu choice, trial-by-combat the single opt-in
existential risk, sanctity of the table while it sits, win = a table path's
final resolution + day >= 90). The win-side state machine (tableWaiting →
tableAnnounce → tableTakeSeat → tableScene → paths → challenge → finals →
won, plus downgrade/conscript/demand-price phases) is read from
src/js/table.js + src/js/table-feared.js + the six sibling path modules —
never invented. Backlog checked before designing: the table-relevant items
are (a) sim-pathselect KILLED 2026-10-15 (PATHSELECT=1 build-matched door
chooser walked feared 13/13 — the door-variety gap is in build composition +
table-side pricing, not in door choice; layer reverted); (b) FEARED STRENGTH
SATURATION (feared prereq strength caps at 100 on every feast-road run —
steve-call, table-side design question); (c) WIN-PATH CONCENTRATION 30/30
FEARED (70/80 armed wins across 4 replicates, steve-call); (d) BUILD THE
WITNESS EXPOSURE SOURCE (Steve DECIDED 2026-10-17 — witness unearned on the
feast road, ledger.exposed=0, bar stays 3 until the source exists);
(e) modalplay's door rule ("a door never offered cannot be taken —
recorded, never forced"). THIS ARM IS NOT A RE-RUN of (a): the killed
mechanism chose the strongest earned door (strength-order); this arm
ASSIGNS doors by pre-registered rotation and FORCES them — a different
mechanism, designed precisely because the table's own pricing always offers
feared as strongest.

Named next this arm answers (sim-seatdrive-posttable, 2026-10-19): the
seatdrive+windefer stack played one identical track on every sitting
(lesser → feared → light → "Show mercy" → win, same day, 10/10). Trial-by-
combat, the six non-feared paths, and dark branches are all unexercised.
This arm is the path-choosing driver: it steers the table after sitting to
exercise the untested doors — and opts into trial-by-combat — while
recording per-path mortality attribution.

Substrate (this arm): the seatdrive seated stack —
withTablePaths(withSeatDrive(withWinDefer(TF base))) on {leadfeast,
belongfeast} tribfloor bases, SEATDRIVE=1 (seat-taking driver ON) +
TABLEPATHS=1 (the path-forcing driver ON; TABLEPATHS unset/0 = pure
delegation, the control side). Env: FEASTSCALE_R13=1 TRIBFLOOR=1
SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1
KILLDISC=1 TABLEPATHS=1 (KILLDISC: the existing
scripts/killdisc-instrument-20261018.js, read-only, reused — no new layer).
No VETREL, no REPOSITION.

Control: the committed corpus at
evidence/2026-10-19/perseed-posttable-seatdrive/ (SEATDRIVE=1, TABLEPATHS=0,
same 8 seeds 64201–64208, base 8c055140a) — REUSED, not re-run. Its corpus
exercised exactly 1 path (feared/light) across 10 sittings. This arm runs
on the current master; FIDELITY=1 pins base drift (TABLEPATHS=0 on the new
base byte-identical to the committed control corpus on 2 seeds × 2
policies).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep or code)

**PRIMARY (diagnostic GO):** >=3 distinct paths exercised with FULL path
attribution across the armed corpus (control corpus = 1), AND the #1
path-specific mortality channel named with >=2x margin over #2. If the bar
misses, report DIAG-NO-GO honestly — never re-scored mid-run (§14).

**GUARDRAILS (all binding):**
- invitation→sitting conversion >= 70% (control: 12 invited → 10 sat = 83.3%)
- no new death mode vs control (death-channel taxonomy identical-by-construction)
- national/table within ±2 of control (control: national 10/16, table 8/16)

**DIAGNOSTIC MISS:** the driver perturbs pre-table trajectories (DET fail),
door forcing unreadable (assigned ≠ walked and fallbacks undocumented), or
the attribution unreadable. A miss is NO-GO, never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating — the same
surface as the control corpus).

**Seeds:** 64201–64208 × {leadfeast, belongfeast} = 16 paired runs,
identical seeds, SEATDRIVE=1 seated substrate + TABLEPATHS=1. PILOT GATE:
leadfeast × 8 seeds first; NO confirm (belongfeast × 8) unless the pilot
meets the PRIMARY bar.

**Instrument:** scripts/policies/tablepaths.js (the driver — TABLEPATHS=1),
scripts/probe-tablepaths-20261019.js (the parent seatdrive probe copied
verbatim + the tablepaths layer outermost + per-run door assignment + per-
path attribution fields; DET/SMOKE/FIDELITY modes),
scripts/analyze-tablepaths-20261019.js (per-path attribution + armed-vs-
control),
scripts/tablepaths-transcripts-20261019.js (seated-window SAY-line capture,
one run per distinct walked path),
scripts/test-tablepaths-20261019.js (proof: door forcing through the REAL
table state machine + DET gate + measurement).
scripts/build-tablepaths-panels.js — §15 panel builder.

**The driver (pre-registered behavior, POLICY-SIDE, not canon):**
- DOOR RULE: at the 7-door offer (phase 'paths', every option id 'path:'),
  choose the run's ASSIGNED door from the pre-registered rotation
  ROTATION = ['feared','defiant','assimilated','beloved','relay'] (run index
  (policyIdx*8 + seedIdx) mod 5) — IF earned per the live
  Game.tableEarnedPaths(). Otherwise FALLBACK = the first earned offered
  door in ['feared','defiant','assimilated','beloved','relay'], recorded
  with the miss (assigned, earnedList, why). A door never offered is NEVER
  taken (the modalplay precedent). Witness and indispensable are NOT in the
  rotation — witness needs ledger.exposed >= 3 (no live source on the feast
  road; Steve decided 2026-10-17 the source must be built first) and
  indispensable needs a FULL seat (wave-4/5 unreachable in sims — the scale
  wall). Forcing either would bypass the engine's prereq (inventing).
- BEAT RULE: challenge beats take the FIRST presented option (the authored
  straightforward walk — the winpursuit drain precedent), EXCEPT the trial
  opt-in (below). Finals: first option. Downgrade: re-apply the door rule
  among the remaining earned 'downgrade:*' options (assigned door if still
  offered and unfailed, else fallback). Conscript: refuse ('conscript:no' —
  the modalplay precedent; canon: refusable). Demand-price: first option.
  The ONLY policy choices are the door and the trial opt-in.
- TRIAL OPT-IN (pre-registered): on EVERY feared walk, the driver picks
  'beat:trial' when offered at beat 2 (the opt-in is the lever; the modalplay
  precedent was NEVER trial). The fight is the engine's real
  startCombat('finale'); the harness driveFights fights it; the wrapped
  tbEnd resumes the table. A trial death IS the measurement — the table's
  own stakes — counted in the per-path mortality channel.
- BRANCH: ledger-earned per TABLE.md — the driver NEVER overrides
  tableBranch. Expected on this substrate: all light (food truth shared).
  Dark variants are recorded as unexercised with the mechanism named
  (they require dark ledger play — a different arm's pre-table
  perturbation, out of scope here).
- The drain mirrors tableRoad exactly (30-answer cap, no-progress stall
  guard, breaks on Game.over and on a live tbfight) and runs inside the
  layer's daily AFTER taking the seat with the inner stack's own exported
  driveSeat verb (the seat must be taken before the drain — the inner
  stack's driveSeat fires mid-inner-daily, so an early drain would lose
  the modal to the inner options[0] drain) and BEFORE delegating to the
  inner stack — so the inner windefer tableRoad finds no pending modal.
  Pre-table the layer is a pure no-op (phase not in the table set →
  delegate); DET pins byte-identity.

**Per-path mortality taxonomy (pre-registered):** every armed death carries
tableAtDeath (phase/path/branch/beat — the parent probe's tableRec,
identical-by-construction) + the classifier channel. Path-specific
channels among seated runs: 'trial-combat' (deaths during the trial fight),
'path-price' (challenge costs: defiant tribute, challenge meters), seated
non-trial deaths (sanctity applies — any death here must be meaningful).
The #1 vs #2 margin is over path-specific channels among seated deaths;
the parent arm's 0-seated-deaths vacuous case is the null hypothesis.

**§15:** the sweep runs through scripts/balance-panel.js (before =
committed control corpus SEATDRIVE=1/TABLEPATHS=0, after = armed corpus,
16 matched case pairs); the compare .md is attached. The panel is the
instrument, the pre-registered GO bar is the judge.

**Telemetry deviation check:** node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-19/perseed-tablepaths/<policy>/s*.json' --metrics
national,table,wins,exiled (same as parent).

**No [needs-eyes]**: instrument + policy driver only, no player-facing
change (policy-side, zero src/js).

---
*(results below — filled after the sweep; pre-registration above is unchanged)*

## Results

16/16 armed runs, 0 bad files, 0 instrument errors (ierr=0, kdErr=0 on all
16), 1 phantom (leadfeast-s64207 — the same phantom the control corpus
carries). FIDELITY=1: 4/4 byte-identical to the committed control corpus
(no base drift — the armed-vs-control comparison is apples-to-apples).
Wall (armed, SEATDRIVE=1 + TABLEPATHS=1): national 10/16, table 9/16, wins
**10/16**, wave-4 8/16, wave-5 0/16, median survival 90d, max 110d. End
reasons: 10 over-other (all won), 6 village-lost. Wall (control,
SEATDRIVE=1 + TABLEPATHS=0, reused): national 10/16, table 8/16, wins
10/16, wave-4 11/16, wave-5 0/16, median 110d, max 182d.

**Verdict: DIAG-GO — with the margin leg recorded as MISSED, not met.**
The diagnostic answered its question: the table's teeth are measured and
named (see below). The pre-registered bar's two legs: (1) ≥3 distinct
paths exercised — MET (5: feared, defiant, assimilated, beloved, relay;
control corpus = 1); (2) the #1 path-specific mortality channel named with
≥2× margin over #2 — the channel IS named (trial-combat ×3, the table's own
stakes, never before measured) but the margin MISSES on the letter (3 vs
2 = 1.5× < 2×). This is not a re-score: the margin is reported as missed,
following the parent arm's precedent (DIAG-GO with the channel leg recorded
as vacuous, not met). See metric review.

### The named mechanism: the driver forces the assigned door through the real state machine, and the trial kills 3/3 bearers

All 10 sittings happened on the same seeds as control (the layer is a
pre-table no-op — DET proves it), seats all lesser, sitting days d90–d109.
The driver walked the assigned door on all 10 (0 fallbacks — beloved was
earned on leadfeast-s64204, relay was earned on belongfeast-s64207; defiant
and assimilated were earned everywhere they were assigned). Branches all
ledger-earned: light ×9, grey ×1 (the relay's GRADIENT band — "The middle
road is open"). No dark branch anywhere on this substrate (as
pre-registered: dark requires dark ledger play).

The three feared walks all opted into trial-by-combat (pre-registered) —
and **all three bearers DIED in the trial** (trialResumes: lost/died ×3,
d90 ×2, d109 ×1). The mantle passed mid-table each time (TABLE.md law 5);
the villages continued weakened; the challenge resumed; **all three runs
still WON** (d91, d91, d110). The trial is real teeth — 100% lethal on
this substrate against the Finale — and the failure-resolution (mantle
passes, weakened continuation, story resolves) works exactly as designed.

### Seated mortality attribution (5 seated deaths — the complete attribution)

- Seated runs: 10. Seated deaths (day ≥ sittingDay): **5**, all on trial
  runs: trial-combat ×3 (Rowan d90, Ines d109, Rowan d90 — the three
  bearers, inTb, trialPending at death), seated-raid ×2 (Olivia d91, Ekua
  d91 — belongfeast-s64203: the two successors, killed by wave-4 monsters
  at Haven during the challenge while sanctity was ACTIVE).
- The 2 seated-raid deaths are the margin-breaker AND a real finding: on
  d90 a wave-4 'suburb' and d91 a wave-4 'eulogy' started fights at Haven
  (combat_start) while tableActive() was true. The sanctity gates in the
  engine cover patrols (game.js:7258) and villagerMonsterTick
  (game.js:18588) — NOT whatever spawns these Haven fights. A d89 wave-4
  'eulogy' aid-fight was already underway pre-sitting (the threat was at
  the treeline), but the d90 'suburb' is new during sanctity. Whether this
  is a sanctity-coverage gap or a legitimate table-stake entourage needs a
  game-code audit — filed as an out-of-arm finding (zero src/js in this
  arm). The pre-registered taxonomy stands: they are 'seated-raid', and
  the margin is missed on the letter.
- The 6 non-seated runs account for all other armed deaths (pre-table
  killers: wild, raid, disease — identical channels to control; the
  guardrail "no new death mode" passes: newDeathModes=[]).
- Unattributed deaths: 0 (armed corpus).

### §15 balanced panel (the instrument; the pre-registered bar is the judge)

`evidence/2026-10-19/tablepaths-panel.md` — before/after through the
scorecard: before = committed control corpus (SEATDRIVE=1, TABLEPATHS=0),
after = armed corpus (SEATDRIVE=1, TABLEPATHS=1), 16 matched case pairs.
Decision: **review_required** — the only flagged metrics are playerDeaths
and playerDeaths100Days (regression_watch, CIs include 0, both policies).
That is the lever working as designed: the trial kills the bearer 3/3.
All other metrics: no_material_signal. The panel's `table` metric does NOT
spuriously regress this time (the invitation-counting artifact from the
parent arm does not fire: table 8/16 → 9/16 — fast sittings land on both
sides).

### Invitation-vs-sitting, per run

| run | end | tableDay | sitting (seat) | door → walked | trial | outcome |
|---|---|---|---|---|---|---|
| leadfeast-s64201 | over-other:d110 won | d109 | d109 (lesser) | feared → feared/light | lost/died | won |
| leadfeast-s64202 | over-other:d94 won | — | d94 (lesser) | defiant → defiant/light | — | won |
| leadfeast-s64203 | village-lost:d69 | — | — | — | — | no-table |
| leadfeast-s64204 | over-other:d90 won | d66 | d90 (lesser) | beloved → beloved/light | — | won |
| leadfeast-s64205 | village-lost:d109 | — | — | — | — | no-table |
| leadfeast-s64206 | village-lost:d22 | — | — | — | — | no-table |
| leadfeast-s64207 | over-other:d90 won | d51 | d90 (lesser) | defiant → defiant/light | — | won |
| leadfeast-s64208 | over-other:d94 won | — | d94 (lesser) | assimilated → assimilated/light | — | won |
| belongfeast-s64201 | village-lost:d86 | d55 | — | — | — | invitation-only |
| belongfeast-s64202 | village-lost:d83 | d69 | — | — | — | invitation-only |
| belongfeast-s64203 | over-other:d91 won | d69 | d90 (lesser) | feared → feared/light | lost/died | won |
| belongfeast-s64204 | over-other:d90 won | d45 | d90 (lesser) | defiant → defiant/light | — | won |
| belongfeast-s64205 | over-other:d90 won | d70 | d90 (lesser) | assimilated → assimilated/light | — | won |
| belongfeast-s64206 | village-lost:d22 | — | — | — | — | no-table |
| belongfeast-s64207 | over-other:d102 won | — | d102 (lesser) | relay → relay/grey | — | won |
| belongfeast-s64208 | over-other:d91 won | d55 | d90 (lesser) | feared → feared/light | lost/died | won |

12 invitations (7 observed waiting + 5 fast sittings), 10 sittings →
83.3% conversion — identical to control. The 2 non-conversions are the
same deferral-window deaths the parent arm named (invited pre-90, died
before the floor).

## Village assessment

What the villages looked like: 16 villages on the seatdrive seated stack,
now with the table's doors forced open. Ten walked the full road — five
through doors no sim had ever played (defiant ×3, beloved ×1,
assimilated ×2, relay ×1) plus three through the feared door's trial. The
trial runs are the story: three bearers walked into the ring against the
Finale and all three died there — and all three villages buried them,
passed the mantle mid-table, negotiated weakened, and still won. The
table's failure-resolution isn't a consolation mechanic on paper; it's the
spine the wins hang on.

Who thrived and who died and why: the non-trial path walks all won
cleanly (defiant paid its prices from a real pantry, beloved played its
variety finale to a real audience, assimilated negotiated its trap,
relay walked the grey middle). The trial deaths are the table's own
stakes, priced and paid: Ines Duarte (d109, leadfeast-s64201), Rowan (d90,
belongfeast-s64203), Rowan (d90, belongfeast-s64208) — all to the Finale's
[150,200] title card and 50–76 hits against ~20/hit retaliation. The two
successor deaths on belongfeast-s64203 (Olivia, Ekua, d91) are the
ambiguous ones — wave-4 monsters at Haven during active sanctity (see the
sanctity finding). The four no-table runs died to the same pre-table
killers as control (disease wipe d22 ×2, wild, raids); the two
invitation-only runs died in the deferral window, unchanged.

What was missing: for the trial walks, a bearer who could survive the
Finale — the scholar's ~20/hit against 1800–2200 HP with the Finale
hitting 50–76/round is a 3-round clock the day-90 build cannot beat. (That
is arguably correct per TABLE.md — the trial is "the one opt-in
existential risk" — but the 3/3 lethality means the trial is currently a
bearer-sacrifice button, not a fight.) For witness and indispensable:
everything — witness needs the exposure source Steve ordered built
2026-10-17; indispensable needs the full seat (wave-4/5 unreachable).

The blank this run fills: the table's other teeth, exercised end to end
for the first time — five doors walked through the real state machine
with full attribution, trial-by-combat measured 3/3 lethal with the
mantle-pass resolution working, the relay's grey band voiced ("The middle
road is open"), and a sanctity-coverage question filed with evidence.

## Sense-testing (SENSE-TESTING LAW)

Read: 5 seated-window transcripts, one per walked path — all FIDELITY-OK
(probe end-day == sweep end-day exactly).

**Each path reads as a different game** (the endgame design's requirement):
- **Feared/trial** (leadfeast-s64201): the terror broadcast, the
  calibration tightrope ("You spend it — the shield, not the sword"),
  "Send your champion," the Finale stepping forward, a real 5-round
  blow-by-blow (20/hit out, 76/50 in), the System going quiet ("OH. Oh
  no. ...The gamblers are very quiet."), the Codex turning its own page
  ("Ines Duarte is dead. You didn't ask. It knew."), the mantle passing
  mid-table to Yara Haddad ("You're not Ines." — no heat, just fact),
  "the village negotiates weakened. The story does not end — it never
  does — but the terms just got worse." Yara walks out a winner: "◈ Yara
  Haddad walks out of the light alone, which is how she walked in. The
  village endures. That was always the story."
- **Defiant** (leadfeast-s64202): "You came to the table to tell it no...
  walking has a price list — and the table just slid it across the
  light." → "Walk away."
- **Beloved** (leadfeast-s64204): the audience chanting in no language
  with words, casting villagers, "Let the audience speak."
- **Assimilated** (leadfeast-s64208): "the assimilation isn't televised...
  a camera that shouldn't exist is rolling, and the footage will leak,"
  placement haggling, "Accept comfort."
- **Relay/grey** (belongfeast-s64207): "The other paths used the System as
  terrain. Here it is the relationship." Switchboard verbs, backfires
  ("it mislearned... the misunderstanding is already in three villages'
  inboxes"), the System learning grief — and the grey band voiced exactly
  per TABLE.md: "The middle road is open." → "Stay both-hands. No merge,
  no champion." → "BOTH HANDS," the machine says, testing the words.
  "THE TENDER ONE TEACHES. THE TOTAL ONE WINS. ...I CAN DO THAT."

**The honest outshone epilogue fires again** (belongfeast-s64207): "◈
OUTSHONE — Jovan Milic did what you would not: acted, boldly, while there
was still time. The village thrives. The god is someone else. The record
notes, kindly and accurately, that you watched."

**Blanks (robotic/static):**
1. The win coda "◈ {Name} walks out of the light alone, which is how she
   walked in. The village endures. That was always the story." repeats
   verbatim across all five paths (Yara Haddad, Bridget Chu, Lena Ruiz…)
   — same-string-different-path repetition, theater class. Pre-existing
   content, out of arm — filed in the backlog.
2. "You don't know how to make a Arrow yet." — grammar ("a Arrow"),
   pre-existing, out of arm (also flagged by the parent arm).
3. "You wait. The light changes. Nothing asks anything of you." — ambient
   filler repeats verbatim; out of arm (also flagged by the parent arm).

## Metric review

**§14 honest metric doubts — for the NEXT run, not this one:**
1. **The margin clause needs a minimum-n gate.** The #1 channel
   (trial-combat ×3) vs #2 (seated-raid ×2) misses 2× at 1.5× — but the
   corpus has only 5 seated deaths across 10 sittings. A 2× margin bar on
   n=5 demands a 4-vs-1 split or better, which is a coin-flip away from a
   3-vs-2 miss no matter how real the #1 channel is. Proposed revision
   for the next run: the margin clause applies only when seated deaths ≥
   8; below that, "#1 named with a plurality" is the bar. The channel IS
   named here — the miss is the bar's, not the measurement's.
2. **The 2 seated-raid deaths are mechanistically ambiguous.** They
   occurred during the challenge on a trial run (the weakened aftermath),
   while sanctity was active — they may be sanctity-leak deaths rather
   than table-stake deaths. If a game-code audit confirms the leak, the
   "true" table-stake channel stands alone at ×3. The taxonomy was NOT
   re-scored; the ambiguity is filed as an out-of-arm finding.
3. **The trial is 3/3 lethal — currently a bearer-sacrifice button, not a
   fight.** The scholar's ~20/hit vs 1800–2200 HP with 50–76 incoming is
   a 3-round clock. TABLE.md calls the trial "the one opt-in existential
   risk," which 3/3 lethality satisfies — but whether the intended design
   is "always lethal" or "winnable by a strong build" is unmeasured. A
   future arm could test the trial against a god-build substrate.
4. **The panel's playerDeaths regression_watch is the lever, not a
   regression.** The §15 compare flags playerDeaths/playerDeaths100Days
   (CIs include 0) — that is the trial killing the bearer 3/3, the
   pre-registered point of the arm. Noted so a future reader doesn't
   misread it.
5. **Telemetry LOUDs are the same regime artifact as the parent arm.**
   The scale-wall baseline is the winseat regime (wins 16/16); this
   substrate is the seatdrive-win-side regime (wins 10/16). No same-run
   investigation needed; the baseline was NOT rolled.

## Named nexts

1. **Sanctity-coverage audit (game-code):** wave-4 'suburb' (d90) and
   'eulogy' (d91) started fights at Haven while tableActive() was true
   (belongfeast-s64203) — the sanctity gates cover patrols and
   villagerMonsterTick, not whatever spawns these. A game-code arm should
   trace the spawn path and close it or price it (out-of-arm finding
   filed).
2. **The trial against a strong build:** is trial-by-combat meant to be
   winnable? 3/3 lethal on the feast-road build. A god-build substrate
   arm would answer it.
3. **Dark branches:** still unexercised — they require dark ledger play
   (a different arm's pre-table perturbation).
4. **Witness/indispensable:** witness needs the exposure source (Steve
   decided 2026-10-17); indispensable needs the full seat (wave-4/5 —
   the scale wall).
5. **The win-coda repetition:** "walks out of the light alone..." is
   identical across paths — a content-variety pass (backlog item filed).

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chimed.)
- **Table-sanctity coverage gap (this arm):** belongfeast-s64203 — a
  wave-4 'suburb' (d90) and wave-4 'eulogy' (d91) started fights at Haven
  via combat_start while tableActive() was true (sanctity announced and
  active at all three deaths), killing two post-trial scholars (Olivia,
  Ekua, d91). The engine's sanctity gates cover patrols
  (game.js:7258) and villagerMonsterTick (game.js:18588) — NOT the spawn
  path of these fights. A d89 wave-4 'eulogy' aid-fight was already
  underway pre-sitting (threat at the treeline — canon holds), but the
  d90 'suburb' is new during sanctity. Needs a game-code audit of the
  spawn path (this arm is zero-src/js). Evidence:
  evidence/2026-10-19/perseed-tablepaths/belongfeast/s64203.json,
  evidence/2026-10-19/sim-tablepaths.md.
- **Win-coda verbatim repetition (this arm, sense-testing):** "◈ {Name}
  walks out of the light alone, which is how she walked in. The village
  endures. That was always the story." is identical across all five
  walked paths — same-string-different-path repetition, theater class
  (like the snare-theater/pantry-spoil findings). Pre-existing content.
- **'dehydration' → 'other' trap** and **"a Arrow" grammar** and the
  **ambient "You wait. The light changes." filler** — all re-observed,
  all pre-existing, out of arm (also flagged by the parent arm).

## Convergence

**converging.** The diagnostic answered its question: the table's teeth
are measured end to end for the first time — 5 doors walked through the
real state machine with full attribution (control corpus = 1),
trial-by-combat exercised 3/3 with 3 bearer deaths and the
mantle-pass-weakened-continuation resolving to wins 3/3, the relay's grey
band voiced, all guardrails green (conversion 83.3% = control, national
10/16 = control, table 9/16 within ±2, no new death mode, wins 10/16 =
control). The margin leg is recorded as missed (1.5× < 2×) with the
mechanism documented. The axis stays converging: wave-5 still 0/16, the
sanctity-coverage question is open, and witness/indispensable/dark remain
unexercised for the named reasons. Flag for coordinator/tracker: the
STANDING DIRECTIVE's lift condition is a coordinator/Steve call (as the
parent arm noted).

## Files

- scripts/policies/tablepaths.js — the path-forcing driver (TABLEPATHS=1):
  assigned-door rule at the 7-door offer (earned-only, recorded
  fallbacks), trial opt-in on feared walks, beat/finals/downgrade/
  conscript/demand-price rules, the forcing drain (mirrors tableRoad),
  per-run attribution into ctx._tablepaths. Default-OFF (pure delegation,
  DET-pinned).
- scripts/probe-tablepaths-20261019.js — the sweep instrument (parent
  probe copied verbatim + the tablepaths layer outermost + per-run door
  assignment + trial-resume capture + trialPending stamp; DET/SMOKE/
  FIDELITY=1 modes)
- scripts/analyze-tablepaths-20261019.js — per-path attribution +
  armed-vs-control (pathChannel taxonomy, PRIMARY verdict, guardrails)
- scripts/tablepaths-transcripts-20261019.js — seated-window SAY-line
  capture with sysSay restored, per walked path
- scripts/build-tablepaths-panels.js — §15 panel builder (before =
  committed control corpus, after = armed corpus)
- scripts/test-tablepaths-20261019.js — proof: DOOR (RED/GREEN/FALLBACK)
  + TRIAL (RED/GREEN/engine) + DRAIN + SMOKE + DET through the real
  table state machine — 30/30 pass; +COMPLETE=1 gate 34/35 (the 1 fail
  is the pre-registered margin clause, reported honestly per §14)
- evidence/2026-10-19/perseed-tablepaths/{leadfeast,belongfeast}/s64201–s64208.json — 16 armed per-seed JSONs (top-level boolean won/national/table)
- evidence/2026-10-19/tablepaths-corpus-summary.json — corpus summary (analyzer output)
- evidence/2026-10-19/tablepaths-transcripts/{leadfeast-s64201,leadfeast-s64202,leadfeast-s64204,leadfeast-s64208,belongfeast-s64207}.txt — one seated-window transcript per walked path [all FIDELITY-OK]
- evidence/2026-10-19/tablepaths-panel.md + .json + -before/-after.json.gz — §15 compare (review_required: playerDeaths/playerDeaths100Days regression_watch — the trial working as designed; all else no_material_signal)
- evidence/2026-10-19/sim-tablepaths.md — this file

## Telemetry deviation check (Steve 2026-10-13)

Ran per-policy:
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current "evidence/2026-10-19/perseed-tablepaths/<policy>/s*.json" --metrics national,table,wins,exiled`.
LOUD lines: leadfeast — "table swung -81%: baseline 16 -> 3", "wins swung
-69%: baseline 16 -> 5"; belongfeast — "national swung -67%: 12 -> 4",
"table swung -62%: 16 -> 6", "wins swung -69%: 16 -> 5".
VERDICT: regime artifact, no same-run investigation needed. The scale-wall
baseline's `_regime` is the winseat regime (wins 16/16); this substrate is
the seatdrive-win-side regime (wins 10/16, table 9/16) — the same pattern
the parent arm measured and documented. The baseline was NOT rolled
(rolling would destroy the winseat regime note); the LOUDs are the
expected artifact of comparing a different regime.
