# Journey succession r254 — Lane B, leg 7 (succession)

Run: 2026-11-20, Lane B leg 7. Base: master `8cd4c0181` at run start.
Rotation-b read 7 at run start; this run writes 4 (endgame next) at
closeout. Lock: playtest-loop-2.lock run_id `playtest2-20261120T0455Z`.
Worktree: `~/workspace/worktrees/journey2-succession`, branch
`journey2-succession` (base 8cd4c0181).

## Leg question (prereg)

r248 left REL-WIT at INSUFFICIENT-DATA with supply PRESENT (Vincent +
Javier, seed 34362). Its metric review filed two candidates for the
next run; this run adjudicated both against the code and the 34362 data
BEFORE adopting either (full reasoning in the prereg):

- (a) bearer-as-mourner: REJECTED — the bearer is the player; driving
  a convo with the bearer as speaker is self-talk, unreachable in real
  play (r25). It would measure a driver artifact, not the game.
- (b) same-day staging: NOT the binding constraint — the r248
  instrument already stages on the detection day, and same-combat
  witness death defeats any staging time.
- The binding constraint is the MULTI-FRESH bind: witnessed deaths
  arrive clustered (combat kills the people standing next to the dead)
  and the mourning pool serves relationship variants ONLY in the
  single-name branch. The witness variant was out of the pool exactly
  when witnessed deaths happen.

The fix: the multi-name mourning branch gains the witness variant when
the speaker witnessed the most-recent fresh dead (`t2MournRel.
witnessed`, read from the latest corpse's witnesses only), same
`{mname}` discipline as the single-name branch. One pool, one gate,
`src/js/convoTopics.js` (+21). Bond/vet multi-name stays open, not
built. No gate/standing/wave/table change.

## Panel (matched before/after, §15)

- Driver: `scripts/journey-succession-r254-20261120.js` (r248 driver +
  PREFIX env only). Analyzer: `scripts/analyze-journey-succession-
  r254-20261120.js` (r248 analyzer, renames only). Runner:
  `scripts/run-journey-succession-r254-panel.sh <ctl|arm>`.
- CONTROL leg (PREFIX r254ctl, fix ABSENT) + ARM leg (PREFIX r254arm,
  fix PRESENT), identical seeds, identical driver, identical analyzer.
  The ONLY difference between legs is `src/js/convoTopics.js`.
- Seeds: 34371–34374 (EARLY_KILL_DAY=40, POST_DAYS=70) + dedicated
  34362 re-run + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25). Pilot
  first per leg (34371 alone, exit 0, then the rest). Both legs ran
  05:12–05:20Z; all 12 seed runs exit 0; both analyzers exit 0.
- 88 transcripts per leg in `evidence/2026-11-20/`.

## Verdicts (binding bars, §14) — CONTROL leg

| Bar | Verdict |
|---|---|
| REL-WIT (staged, floor 3 single-fresh sittings) | **INSUFFICIENT-DATA** — 0 servings, 0 single-fresh draws. |
| REL-BOND | **PASS** — 5 servings, all 5 where the relationship held, 0 where it did not. |
| REL-VET (revised denominator, 10-draw floor) | **PASS** — 3 servings, all 3 where both were veterans, 0 otherwise; 21 opener draws in both-veteran convos (floor held with margin). |
| MOURN-TEMPLATE | **PASS** — 48 name-parameterized servings, no template re-served for a different dead, none repeated across speakers about the same dead within 5 days. |
| MOURN-EXHAUST | **PASS** — 0 exhausted-line servings in mourning sittings. |
| MANTLE-FINE | **PASS** — 27 deaths observed, 0 flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips. |
| DRY CENSUS | **PASS** — 0 dry hits of any class; 12 honest fallbacks. |
| WILD CHECK | **PASS (no regressions observed)** — r192 deflect_q 0, dlg:doubt 0, other-class 0; MOURN-EXHAUST 0; no new dry class in any of the 88 transcripts. (Adjudicated from the DRY-CENSUS r192 wild check + exhaust + template sections — the analyzer emits no labeled WILD line, same as r248.) |
| C3d WILD HOLD | **PASS (no erasure)** — 0 C3d-class erasures; the live-want recap path did not engage this panel either (no recap serving while a live want was open). |
| F5 WILD EXERCISE (DESCRIPTIVE) | 0 settled-favor firings this panel by the r248 convention (no F5 firing counter exists in the analyzer; no settled-favor variant serving appears on any panel surface). Rolling 5-panel window (r232+r233+r245+r248+r254ctl) stays 0. Binding proof is the r225 harness: **22/22 GREEN** (re-run on this base). |
| CONTROLS (smoke S_fixed) | **PASS** — smoke 33998 at-death snapshot matches r233 exactly: handoff d6 Heinrich → Grace, relPost bonds 33, relD14 50, selfId grace_obi. Pick rank 1, funeral INCALL true, selfReq 0 on every seed. |
| CAP-NC (descriptive) | INSUFFICIENT-DATA — 2/2 eligible seeds bonded-by-deadline (denominator < 3). |
| WITNESS-CENSUS (diagnostic) | **SUPPLY-ZERO** — 217 corpses (50 person, 167 monster); 0 witnessed person corpses. |
| WIT-SIT (diagnostic) | **NO-STAGING** — 0 staged, 0 fired. |

Qualifying convos panel-wide: bond-close 21, both-veteran 34, witnessed 0.

## Verdicts — ARM leg (the fix)

The ARM leg is **byte-identical to the CONTROL leg**: all 6 per-seed
stdout JSONs compare identical (`cmp` clean), and the arm analyzer is
identical to the control analyzer modulo the `r254ctl` → `r254arm`
prefix in embedded filenames. Every verdict above holds unchanged on
the arm leg, including the smoke snapshot (d6 Heinrich → Grace,
relPost 33, relD14 50, grace_obi — identical).

That identity is the honest result, not a null run: with 0 witnessed
person corpses on the panel, the fix's gate never opens, the pool never
changes, and the trajectories cannot diverge. The fix is proven by the
targeted proof test (below), and the panel proves it is inert — no
regression, no perturbation — when the gate is closed. REL-WIT stays
INSUFFICIENT-DATA in the wild on this panel for lack of supply, not
for lack of a variant.

## The fix, proven (proof test)

`scripts/test-journey-succession-r254-multiwit-20261120.js` — 4 cases,
each in its own process:

- `multiwit-fires`: speaker in the LATEST corpse's witnesses → witness
  opener served in 7 sittings, naming the latest dead ("I was there
  when Reagan fell. I keep seeing it when I blink, and blinking
  doesn't help."). RED before the fix (0 witness openers), GREEN after.
- `multiwit-silent`: speaker witnessed neither death → 0 witness
  openers. GREEN before and after (gate holds shut).
- `multiwit-wrongdead`: speaker witnessed the EARLIER corpse only → 0
  witness openers. GREEN before and after — the lines cannot name a
  dead person the speaker did not see die.
- `multiwit-names-latest`: both witness lines served, naming the latest
  dead (Jamal), never the earlier dead (Bao); no literal `{mname}` in
  any served line. RED before the fix, GREEN after.

**ALL GREEN after the fix.** Regression: the r232 relationship-
mourning proof test re-runs **ALL GREEN** on this base (single-name
behavior unchanged). Commit `972645078` (convoTopics.js +21, proof test
+218).

## REL-WIT: why the panel cannot judge the fix (the finding)

Two stacked facts, both measured this run:

1. **Supply collapsed on this base.** The control leg's WITNESS-CENSUS
   is SUPPLY-ZERO: 50 person corpses, 0 with witnesses (r248's panel
   had 2, both on 34362). Witnesses are recorded ONLY on combat deaths
   (`fightWitnesses` in the field-fight path); sickness, thirst,
   wounds, starvation, "the wild", "a stranger", "the expedition",
   and ambient "monster" deaths register with no witnesses. On this
   panel the villages died of sickness (34362: 9 sickness deaths of 19
   person corpses) and wounds, not in field fights with bystanders.
2. **The 34362 trajectory drifted.** Phase A is IDENTICAL to r248
   (first death day 28, Hermann → Stan, alive 10, fallen 2) — the
   driver and the base agree through day 28. The post-death phase
   diverges: r248's chain Stan → Thabo (day 50) with 2 witnessed
   combat deaths (Vincent day 49, Javier day 50); the control chain
   Stan → Vincent (day 31) with 0 combat person-deaths and 9 sickness
   deaths. The only combat-behavior change in the 101 commits between
   bases is the BOWCRAFT turn-on (d56fbe819: bows always on in live
   play) — the prime suspect for the cascade, UNPROVEN (no bisect
   this run). No commit in the window touched diseases.js, combat.js,
   fieldFights.js, corpses.js, or convoTopics.js.

So the witness variant's wild serving needs three rare things to
coincide — a witnessed person death, a multi-name fresh window, and a
driven sitting in that window — and this panel had zero of the first.
The fix is built and proven in the harness; its wild serving is still
unmeasured. The next run needs a supply-first design (screen a fresh
band for witnessed combat deaths, then run the matched pair on the
seeds that carry supply) — filed under metric review, not attempted
here: changing seeds mid-run would break §14 binding.

## People check (transcripts read in full)

- **Muhindo, 34362 d+14, mourning Didier** (bond-close): "I knew
  Didier. Really knew them, not the fire's version. Mine. And now
  there's just the fire's." Plus the cope line: "I braid grass while
  listening to plans. It doesn't bring anyone back. It just keeps my
  hands from shaking." The sitting has a purpose (comfort, party
  invite, name the party "The Company", Muhindo becomes Scout) and
  resolves. A person grieving, not a template.
- **Carmine, 34373 d+46, mourning Tyler** (bond-close): "You asked me
  that before. It's a different question now." + the bond line for
  Tyler. The role handoff is handled in the fiction (Ursula steps
  back: "Scout is yours now." — "Roles are promises. There's only one
  of each."). The deflection ("They take it in and give nothing back.
  Not yet.") reads as a villager closing a topic, honestly.
- **Chloe, 34371 d+65, mourning Benoit** (generic single-name): "Since
  Benoit died... I keep expecting to see Benoit at the fire. Stupid."
  — inside a wider conversation about Chloe wanting a place that feels
  like home ("Walk with me? I want another pair of eyes on
  something."). The mourning lands as one thread among others. The
  sitting ends cleanly on silence: "A comfortable quiet settles.
  They smile a little, and let it be." / "This was good." They mean it.

**People check: PASS.** No dry lines, no fabricated history, no filler
loops in the sittings read. Mourning names the dead every time.

Carried note, refined: the driver's "Wait — what were we talking
about?" re-ask fires on 10 transcripts this panel (r248's carried
note). It reads as the driver pestering when the sitting has no live
thread to return to (Muhindo, Carmine) — but reads NATURALLY when a
want is open (Chloe: "Still on wanting to find a place that feels
like home."). The re-ask is fine with a live want, flat without one.
The note stays open, with the refinement.

## Village assessment (plain words)

Six villages, six different ways to lose a scholar. The mantle passed
27 times and never stuck — every handoff landed the same day, nobody
was left waiting. The deepest chain was seed 34374, where the mantle
changed hands eleven times (Avery → Kennedy → Lamar → Rosa →
Hryhoriy → Nikolai → Elena → Olivia → Ursula → Miguel → Andiswa) and
the village ended with 3 alive and an empty pantry. Seed 34362 ended
thinnest in a different way: only 2 bearer deaths, but 23 fallen — a
sickness took the village while the leaders survived (3 alive, pantry
1,600). Seed 34372 lost almost nobody (1 fallen, 11 alive, pantry
20,121) — the quiet village. Seed 34371 lost five bearers and still
ended with 10 alive and food in the pantry; seed 34373 lost seven
bearers and ended with 7 alive. Nobody starved on a full pantry; the
villages that ended poor ended poor because the people who knew how to
keep them fed kept dying — or, on 34362, because sickness took the
workers while the leaders lived.

Per-seed census (end of panel, both legs identical): 33998 alive 11 /
fallen 1 / pantry 22,336; 34362 alive 3 / fallen 23 / pantry 1,600;
34371 alive 10 / fallen 7 / pantry 7,217; 34372 alive 11 / fallen 1 /
pantry 20,121; 34373 alive 7 / fallen 9 / pantry 18,659; 34374 alive
3 / fallen 14 / pantry 0. Bearer deaths 27 panel-wide
(1/2/5/1/7/11).

## Telemetry

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json --current
'evidence/2026-11-20/journey-succession-r254ctl-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,
week2.deadBearerMentions` (and the same for the r254arm files):

**2 LOUD lines, both explained, identical on both legs** —
deaths.bearer +255% (baseline 7.6 → current 27) and census.fallen
+285% (baseline 14.3 → current 55). The tool sums the 6 current
files; the baseline stores means (the documented means-vs-sum
mismatch, unresolved since r229). Per-file means this panel are BELOW
baseline (bearer 4.50 vs 7.6; fallen 9.17 vs 14.3; per-seed bearer
1/2/5/1/7/11, fallen 1/23/7/1/9/14). No real deviation. **Baseline
NOT rolled.**

## Gate

Filled in by adoption from the run's gate log
(`evidence/2026-11-20/journey-succession-r254-gate.log`, launched
05:23:15Z, complete, final summary line present):

**check.js --quick: 339 passed, 5 failed in 802s — 0 attributable.**
All 5 failures are the standing set, adjudicated from the log:

- `scripts/godpath/test-measurement-proof-update.js` + `scripts/godpath/test-measurement-workflow.js` — the measurement-proof staleness pair (proof re-sign round 22 still owed; program maintenance, not a blocker).
- `scripts/godpath/test-phone-frame-proof.js` — the stale phone-frame receipt (standing).
- `scripts/godpath/test-living-garden-deed-attainment.js` + `scripts/godpath/test-one-person-army-deed-attainment.js` — 120s timeouts (standing; both exceed the cap under load).

Zero mentions of the fix's area in the failures; no regression from
the witness-variant change. (Adoption re-runs the fix proof test and
check.js --quick fresh on the rebased tip before merging; results
recorded in the closeout commit if they differ.)

## Reachable / Fun / Winnable

- **Reachable: YES, with a caveat.** The succession leg fires on every
  seed: the mantle passes, checkpoints sit people down, funerals are
  called, newcomers arrive and bond. The WITNESS variant specifically
  is reachable in the harness and (now) reachable in multi-name
  sittings — but no wild serving was observed, because witnessed
  deaths are the rare part. The content exists; the supply is the
  wall.
- **Fun: mostly.** The mourning writing is the strongest part of the
  leg — villagers grieve by name, with habits and details that belong
  to the dead. The weak part is the witness question itself: the game
  knows who watched someone die and now, with this fix, can say so
  even when several died at once — but only when someone actually
  watched, and on this panel nobody did.
- **Winnable: not judged on this leg.** Succession measures the
  handoff, not the win.

## Metric review

- **REL-WIT stays INSUFFICIENT-DATA in the wild** (0 servings, supply
  zero). The fix is proven by the targeted proof test, not by the
  panel. Next step, filed here: a supply-first panel — screen a fresh
  band for witnessed combat deaths, then run the matched control/arm
  pair on the seeds that carry supply. Do NOT re-run the same band
  hoping supply appears; the supply rate is ~2 witnessed deaths per
  11 seed-runs, clustered.
- **Candidate (a) bearer-as-mourner: REJECTED this run** (self-talk,
  unreachable in real play) — filed in the prereg so the next run
  does not re-propose it.
- **Candidate (b) same-day staging: NOT the binding constraint**
  (same-combat witness death defeats timing) — filed in the prereg.
- **Multi-name BOND/VET mourning: still open, not built.** This run
  built the witness arm only. The bond/vet arms already PASS via
  single-name; whether they should also serve in multi-name is a
  separate design question.
- **F5 WILD EXERCISE stays DESCRIPTIVE**: 0 firings this panel by the
  r248 convention; rolling window 0. The r225 harness (22/22) remains
  the binding proof. Note for the next run: no F5 firing counter exists
  in the analyzer — the count is a convention, not an instrumented
  metric. If F5 wild exercise is to stay a reported number, it needs
  a counter in the driver/analyzer.
- **C3d**: the live-want recap path did not engage again (seventh
  straight panel). The bar stays; the question is now whether the
  path is reachable at all in the wild, not whether it is broken.
- **CAP-NC**: denominator starved again (2 eligible). No revision —
  the starvation is by design (newcomers arrive late or not at all).
- **Day-skip watch**: 0 skips — twenty-first straight panel watch,
  still clean.
- **Proof refresh rounds 11 + 12 remain owed** (not this run's).
- **Scout-role ping-pong**: carried as an owed driver note
  (checkpoint loop untouched this run to protect the smoke control).
- **Driver re-ask pestering**: carried, REFINED — the re-ask reads
  fine with a live want open, flat without one (see People check).
- **Multi-name openers in driven sittings**: 0 multi-name openers
  were served in any driven sitting this panel (all 48 mourning
  servings are single-name shapes), even though multi-death days
  occurred. The multi-name branch engages in the wild, but driven
  sittings rarely land in a multi-name window — a second rareness
  stacked on the witness-supply rareness. The next supply-first panel
  should record multi-name sitting counts, not just witness servings.
- **m3v2b**: 5/6 true (34362 false, echoV2b=1 — the same seed that
  missed on r248). Carried, not a bar.
