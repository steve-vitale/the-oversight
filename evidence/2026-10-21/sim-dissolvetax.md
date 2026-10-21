# sim-dissolvetax — realm-dissolution attribution instrument on the winning substrate

Run: fleshout-20261021T0915Z, arm sim-dissolvetax
(DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js changes,
zero policy changes). Worker tree: ~/workspace/worktrees/sim-dissolvetax.
Backlogs #713 + #750. The scale wall's second half: HOLDING national.
Loop-B (sim-surpluskeep-diag-b) found 7/9 belong losses are
`primary-realm-collapse` on substrate 9c634ebac — Haven's sub-link healthy
while the primary's foreign polity falls apart — with a PENDING steve-call
on whether foreign-polity collapse should be decisive (#750, still open).
This arm builds the instrument that attributes EVERY realm loss to its cause,
so the next run's lever targets the real drain.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14-15 — written BEFORE any sims)

- **PRIMARY (DIAG-GO):** attribution completeness on dissolving runs —
  100% of realm losses attributed with 0 unexplained; 0 instrumentErrors.
- **GO:** every dissolving run 100% attributed, 0 unexplained,
  0 instrumentErrors; honesty cross-check >= 99% (3 runs, recomputed by hand
  from raw census).
- **Minimum:** >= 4 dissolution events across the sweep. Below 4 =
  insufficient-data: report-only, NOT a failure.
- **Unit:** the run (16 runs). No control arm — diagnostic on the winning
  substrate; the contrast is between CAUSES, not arms.
- **SECONDARY (report, don't judge):** the taxonomy table (counts per class,
  split lead vs belong); median days-to-dissolution per class; trust
  trajectories on sub-drift cases (does #751's unvoiced erosion show in the
  census?); wall numbers of the sweep (national ever/end-state, table, wins,
  median survival).
- **OUTPUT DELIVERABLE:** the taxonomy table PLUS the single most-leverable
  dissolution cause named as the NEXT lever (with the mechanism and the lever
  shape). If the answer is primary-foreign-collapse and the steve-call is
  still pending, say so loudly and propose the best policy-touchable proxy.
- **Horizon:** 180d death-aware (+10d tail max).
- **Seeds:** 8 FRESH seeds 64901-64908 (verified unused — asserted inline in
  both the proof E2d and the sweep; registries checked: evidence per-seed
  filenames + sweep SEEDS lists) x {leadfeast, belongfeast} = 16 runs.
- **Policies:** VCE.armedFor from scripts/policies/vgearconfirm.js (the
  VGEAR=1 winning substrate; no intervention arms).
- **Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 VGEAR=1 (KILLDISC unset — not needed; asserted unset like the
  other forbidden extras).
- **§15 note:** no before/after — diagnostic with no intervention (§15 panel
  is for lever before/after).

## Canon

docs/CANON.md read first. **No canon doc covers travel/regional/hierarchy**
(realm/link mechanics, dissolution paths) — the canon manifest lists
DISEASES/BEAR/PRESERVATION/MONSTER-WAVES/CONTESTS/CONVERSATIONS/PARTY/
SYSTEMS/BALANCING/TIME-ECONOMY/KIN/FANS; none covers links, realms, courts,
or the scale ladder. Per the brief's instruction ("say so instead of
inventing"), all mechanism statements below are grounded in src/js
reads (hierarchy.js, villageAgency.js), cited by line area, not in canon
invention. (docs/SCALE.md is referenced by code comments but was not read
as a canon source for this arm; the engine comments in hierarchy.js were.)

Engine facts established by read (hierarchy.js):
- A polity is one primary with >=3 active subordinates (polityOf, ~L1880).
  Haven reaches national six ways: LEAD (Haven primary of >=3 seasoned
  subs), BELONG (Haven subordinate in good standing — trust >=50, arrears 0,
  link >=14d — to a primary whose foreign realm holds >=4 fires),
  COVENANT/TRADE (peer leagues >=4, seasoned), CONQUEST, REFUSE.
- Seasoned = 30+ days old AND trust >=40 (conquered: the season, not the
  trust) — _linkSeasoned (~L228). SUCCPOLITY/SUCCGRACE gates are UNSET on
  this substrate, so the funeral-hour trust reads apply.
- nationalLive/globalLive are live state: _checkNational (~L2100) clears
  them aloud when no qualifying polity and no pending beat ("◈ The realm
  came apart...").
- breakLink 'how' values in the engine: succession, walked, seceded, revolt,
  released, gambit (plus default 'severed'). NO raid-related break cause
  exists; no mechanic destroys villages by raid (raid-burn class is
  reachable only via raid-destruction say-lines — expected 0).
- foreignPolities() records only ever GROW (subs.push in _foreignPolitySim,
  ~L2076); no splice/pop anywhere in src/js. A foreign realm that reached
  >=2 subs cannot shrink by engine mechanics found — if the census shows a
  shrink, that is itself a finding to report.
- Schisms keep the parent village id (_vaMakeSplinterVillage,
  villageAgency.js ~L469) — they cannot shrink a polity by themselves
  (schism class carries the honest 'mechanism unconfirmed in engine' note).
- Neglect snap: succession break when trust < 20 AND 14+ days with no
  upkeep (tributePaidWeek/lastKeptDay math, _linkNeglected ~L1475).
- Arrears > 0 ALONE disqualifies belong good-standing (no break needed).

## Proof results (pre-sweep — all green, 2026-10-21)

scripts/test-dissolvetax-20261021.js: **24/24 GREEN** (run with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 per
the Usage header — ENV TRAP honored).

- E0: module shape — install/attributeDissolution/dawnDissolveSensor exports;
  TAXONOMY is exactly the brief's 7 classes (2/2).
- E1 det-gate: instrument-on vs instrument-off byte-identical trajectories
  on the EXTENDED canonical projection (dayHash + hierarchy: links minus
  unstable link.id, foreignPolities, nationalLive/globalLive/nationalShape),
  2 seeds (64911 leadfeast, 64912 belongfeast) x 60d (2/2). The wraps add
  zero drift — the foreignPolities snapshot/restore guard is unobservable.
- E2 env-gate: pinned substrate accepted; missing FEASTSCALE_R13 rejected;
  forbidden SURPLUSFEED rejected; seeds 64901-64908 asserted fresh inline
  (evidence per-seed filenames + sweep SEEDS lists scanned; the arm's own
  files excluded — the freshness question is other experiments) (4/4).
- E3 read-only static scan: no Math.random(, no R( draws, no pick( calls,
  no Game.state writes in the instrument source (4/4).
- E4 RED->GREEN on synthetic fixtures: one forged realm-loss record per
  taxonomy class attributes correctly — primary-foreign-collapse,
  arrears-disqualify, sub-drift (no-break), sub-drift (break-neglect),
  other (break-revolt), other (break-policy), schism (context-only, honest
  'mechanism unconfirmed in engine' note), raid-burn, other (inactive link,
  no break); a forged unattributable record lands in `unexplained` WITH the
  honest reason ('no polity-component delta...') (10/10). A multi-link
  belong fixture verifies the engine-faithful own-link pick (first dir-0
  link whose primary held a >=4-fire realm at sat — the _belongPolity
  first-match semantics).
- D2: 180d instrumented runs complete + deterministic re-runs
  byte-identical (64913 leadfeast, 64914 belongfeast) (2/2).

Two analyzer-only edits after the full proof (belong own-link pick;
evidence names the village on belong sub-drift) were re-validated with the
fast gates (E0/E2/E3/E4 + multi-link fixture: 16/16) on the final file; the
sensor/wrap code the E1/D2 gates ran against is byte-identical to the
sweep's version.

## Sweep results (16 runs, VGEAR=1 winning substrate)

8 fresh seeds 64901-64908 x {leadfeast, belongfeast}, 180d death-aware.
16/16 runs completed, 0 instrumentErrors. Per-seed JSONs +
full census in evidence/2026-10-21/perseed-dissolvetax/
(`dissolvetax-<base>-s<seed>.json` + `.census.json`).

**Only 2 realm losses in 16 runs** — below the pre-registered minimum of 4.
Per §14 this arm is **insufficient-data: report-only, NOT a failure** (and
not DIAG-GO). The instrument itself is proven (24/24 proof gates; both
losses 100% attributed, 0 unexplained, 0 instrumentErrors).

### Taxonomy table

| class | all | leadfeast | belongfeast |
|---|---|---|---|
| primary-foreign-collapse | 0 | | |
| sub-drift | 1 | 64908 | |
| arrears-disqualify | 1 | | 64907 |
| raid-burn | 0 | | |
| schism | 0 | | |
| other | 0 | | |
| unexplained | 0 | | |

Per-loss evidence:
- **sub-drift** — 64908/leadfeast d108: Thornfield trust 43→38 < 40 across
  the loss (age 81d, no break). Trail: 65→38 over ~30 days of steady
  erosion (d81:65 … d106:43, d108:38). The sub's famine ("Nothing comes
  from Thornfield this week — their fields are as empty as the wagons
  look", d105) starved the link's trust below the seasoned bar.
- **arrears-disqualify** — 64907/belongfeast d92: own sub-link to
  Thornfield arrears 0→135 kcal across the loss (trust 70→64, age 36d).
  Court sat d80 (belong); 12 days later a single 135-kcal tribute shortfall
  (pantry: "about 2 days of food at the current burn") tripped the
  arrears≡0 good-standing bar. Voiced: "Tribute short — 11,115 of 11,250
  kcal so far this week. They'll count it. Arrears grow teeth." (d89).

### Wall numbers (n=16)

national end-state **13/16** | ever **15/16** | table **15** | won **15** |
wave-4 12/16 | wave-5 **0/16** | exiled 0 | median survival 92d | max 150d.

Notes: leadfeast-s64902 died d150 with the realm intact (no loss edge —
"end-state national on a corpse is not a hold", loop-B's gap definition
caveat stands). belongfeast-s64905 won d~90 via the table WITHOUT ever
sitting the court (ever-national 0) — a win path that skips national
entirely; worth a look by whoever owns the win-path axis. Wave-5 still
0/16 on the winning substrate — the wall's remaining half is the wave-5
door, not realm-holding.

### The big finding: the holding problem does not reproduce here

Loop-B's motivating crisis (0/8 belong holds, 7/9 losses
primary-foreign-collapse on the bare 9c634ebac substrate) is GONE on the
VGEAR=1 winning substrate: belong holds 6/8 end-state (7/8 ever sat), lead
holds 7/8 (the 8th died with the realm intact). **primary-foreign-collapse:
0 occurrences in 16 runs.** The scale wall's second half (HOLDING national)
is largely solved on the substrate Steve actually ships — the wall is
wave-5 (0/16), not realm-holding. The pending steve-call #750 (should
foreign-polity collapse be this decisive?) is scoped to the bare substrate;
on the winning substrate the question is moot — there is no foreign-collapse
drain to rule on.

## Honesty cross-check (3 runs recomputed by hand from raw census: 3/3 = 100%)

1. **leadfeast-s64908 d108** (sub-drift): hand-read census — d106 dawn:
   village_0 t96/a81, village_1 t82/a80, village_2 (Thornfield) t43/a79 —
   3/3 seasoned, polity holds. d108 dawn: Thornfield t38 <40 — 2/3 seasoned,
   _checkNational dissolves. Breaks in [80,108]: none. Schism/raid on
   members in-window: none. → sub-drift. MATCHES.
2. **belongfeast-s64907 d92** (arrears-disqualify): sat d80 belong. d91
   dawn: own link to Thornfield trust 70, arr 0, age 36 (good standing);
   fp village_2: 3 subs → size 5 ≥4 → polity holds. d92 dawn: arr 135 →
   good standing fails → dissolves. Breaks on own link in [64,92]: none
   (the d55 'walked' break was village_1, pre-court). → arrears-disqualify.
   MATCHES.
3. **leadfeast-s64901** (hold): no lost edge; end-state national=1; census
   shows nat=true through the d92 win. No missed loss. MATCHES (vacuous).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

- s64908 (sub-drift): Haven tends Thornfield faithfully at d100 ("Haven
  sends 1,500 kcal of grain to Thornfield's fire — not tribute, the other
  way around"), d105 Thornfield's own tribute comes up thin ("their fields
  are as empty as the wagons look"), d107 "◈ The realm came apart". The
  30-day trust erosion (65→38) is NEVER voiced as a cooling bond — the
  #751 narration blank (trust-erosion beats for sub-seasoned links),
  confirmed again on the winning substrate. The dissolution itself reads
  as loss, not noise.
- s64907 (arrears-disqualify): the arrears mechanism IS voiced — the
  pantry math ("tribute takes 10,994 of 11,250 kcal and no more... the
  village eats first"), "Arrears grow teeth", then the realm coming apart.
  Cause and effect are legible; the knife-edge is the design question, not
  the narration.

## Metric review (§14)

- The pre-registered MINIMUM (≥4 dissolution events) was not met (2) —
  reported as insufficient-data per the binding rule, NOT re-scoped and
  NOT re-scored. The DIAG-GO bar is therefore not claimed.
- The PRIMARY bar's letter (100% attributed, 0 unexplained, 0
  instrumentErrors) held on the events observed (2/2, 0, 0) — reported as
  instrument honesty, not as a GO.
- Honesty cross-check 3/3 = 100% ≥ 99% — met.
- One instrument gap was found and FIXED mid-run (analyzer evaluated only
  the last nat-true dawn and missed causes landing in the final day — both
  real losses were initially `other`/`unexplained`). The fix (evaluate the
  loss-dawn state Q, attribute the P→Q delta — justified: _checkNational
  runs daily, so a loss at L means the cause is strictly in the delta) is
  analyzer-only, deterministic on stored records, re-validated (fast gates
  16/16; both losses re-attributed from the same census). The sensor/wrap
  code the E1/D2 det-gates proved is byte-identical to the sweep's.
- Metric doubt for the NEXT diagnostic arm: on substrates where realms
  hold (like this one), "dissolution events per 16 runs" is the wrong
  denominator — pre-register against a substrate with known dissolution
  density, or against a longer seed list, or accept report-only.

## Telemetry deviation check

`telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'perseed-dissolvetax/dissolvetax-*-s*.json' --metrics
national,table,won,exiled` → **LOUD: won newly appeared (baseline 0 →
current 15)**. Verdict: EXPLAINED — the scale-wall baseline predates the
winning substrate; 15/16 wins is this corpus's expected profile
(vgearconfirm vgear arm: 28/32). national/table/exiled quiet. Baseline NOT
rolled (it is the scale-wall reference, not this substrate's profile).

## Convergence state

**insufficient-data (report-only) — instrument proven, substrate holds.**
The dissolvetax instrument is DIAG-ready (24/24 proof, 0 unexplained on
real losses, 100% hand-check). Substantively: on the VGEAR=1 winning
substrate the realm-holding problem is not the wall — 13/16 end-state
national, 15/16 wins, wave-5 0/16. The scale-onramp axis's remaining half
is the wave-5 door, not dissolution. No lever is confirmed by this arm
(n=2); see the named next below.

## Deliverable: the named next

**No lever is confirmed — and that is the finding.** With 2 dissolution
events, naming a lever would be noise-chasing. What the data supports:

1. **The holding war is over on the winning substrate** (13/16 end-state,
   15/16 ever, 2 losses with legible causes). Do NOT spend another
   dissolution-tax arm here. If the axis wants dissolution density, run
   this instrument on the bare 9c634ebac-family substrate where loop-B saw
   0/8 belong holds — that is where the taxonomy earns its keep, and where
   the pending steve-call #750 actually bites.
2. **The two observed mechanisms, if a next arm wants them:**
   - (a) **The belong arrears≡0 knife-edge** — a single 135-kcal shortfall
     week dissolved a 12-day-old realm. The policy-touchable proxy (no
     engine change): belongseek's `pantryKcal > 2× tribute` skip gate —
     the policy chose the skip that created the arrears. A "never skip the
     tribute that keeps the court" guard is the lever shape. Engine-side,
     the bar itself (arrears≡0 vs a grace band) is a Steve-call.
   - (b) **Sub-seasoned trust erosion, unvoiced** (#751, confirmed again):
     Thornfield 65→38 over 30 days with no fiction. Narration blank, not a
     numbers lever.
3. **Say it loudly per the brief:** the answer is NOT
   primary-foreign-collapse on the winning substrate (0/16 runs). The
   steve-call #750 stays open but is now scoped: it concerns the bare
   substrate's belong road, not the shipped game.

Findings appended to hidden_files/sim-findings.md: the arrears knife-edge
(135 kcal), the #751 reconfirmation, won-without-national (s64905).
