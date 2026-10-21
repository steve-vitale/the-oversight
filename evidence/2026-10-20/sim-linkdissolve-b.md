# sim-linkdissolve-b — WHY do armed runs lose the realm more often post-court? (link-dissolution causes vs trim)

Run: fleshout-loop-b-20261020T2235Z, arm sim-linkdissolve-b
(DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js changes,
zero new policy layers). Worker tree: ~/workspace/worktrees/sim-linkdissolve-b.
Answers the named next from sim-surplusfeed-national-b (landed c7697540c,
verdict 'open'): instrument link-dissolution causes vs trim
(post-court tribute/upkeep flows, trust trajectories under wave-4 pressure)
on the same paired substrate. Input to the SURPLUSFEED default-ON call.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sweep sims)

- **Question**: the parent rejected the standing-accumulation-tax hypothesis
  (Pearson(trimKcal, feastGiftSpendDelta) = −0.529, wrong-signed) but found
  something real: armed runs reach the court just as often (ever-national
  12/16 vs 13/16) but lose the realm more often post-court (9/12 vs 6/13).
  WHY — which named engine causes dissolve the post-court realm, and does
  the SURPLUSFEED trim drive dissolution through the upkeep channel (leaner
  pantry → tribute/tend/pool shortfalls → trust craters → links drop below
  the seasoned bars → `_havenPolity()` null → "the realm came apart")?
- **Mechanism chain under test (all engine code, read-only)**: nationalLive
  clears ONLY at hierarchy.js:2113, when `_havenPolity()` returns null while
  national is live. The polity bars: LEAD = ≥3 active HOME-primary links
  seasoned (age ≥30d AND trust ≥40); BELONG = Haven-subordinate link in good
  standing (trust ≥50, arrears = 0, age ≥14d) to a primary whose foreign
  realm holds ≥4 fires; COVENANT/TRADE = ≥3 seasoned peer links (age ≥30,
  trust ≥40). Trust falls via: tribute shortfalls (Haven-subordinate:
  arrears + short, trust −6 at the weekly tick; HOME-primary sub pays thin:
  trust −1, nothing: −2), leader-death haircuts (−8 × deaths),
  neglected-link neglect (no upkeep 14d → snap risk at trust <20),
  covenant pool pour shorts (trust −4 across the league), refused calls
  (−15), conquest sabotage/revolt, renegotiation silence (−6), crisis hits
  (−10). Haven's pantry pays the upkeep: tendLink 1,500 kcal/week/link
  (trust +8, frac-scaled; bare pantry = refusal, no gain), payTribute
  (owed/week; short → arrears + trust −6), covenant pool pour 2,000
  kcal/week (short → trust −4 league-wide), trade upkeep 400 kcal/week.
  The policies GATE upkeep on pantry: leadcourt skips tending below 20k
  pantry; belongseek skips tribute below 2× owed. Trim → leaner pantry →
  fewer/smaller upkeep payments (or policy-skipped weeks) → trust decay →
  bars fail → dissolution.
- **PRIMARY GO gate (binding; attribution completeness)**: ≥80% of
  post-court realm-dissolution events attributed to named cause classes,
  0 unexplained mechanism classes. An event is ATTRIBUTED iff every link
  that counted toward the court-day polity and no longer qualifies at
  dissolution has a named failing bar (trust-below-bar / arrears-bar /
  link-broken / primary-realm-shrank / mercy-expired). UNEXPLAINED = the
  instrument cannot name why `_havenPolity()` went null for the event
  (a mechanism class outside the named set, or no identifiable dropout).
  Death-fork pairs (village dead before/at dissolution with no live polity
  to diagnose) are reported separately, not counted as unexplained.
- **SECONDARY (the default-ON input; trim→upkeep verdict, pre-registered
  bars)**: (S1) DOSE: Pearson(trimKcal, postCourtUpkeepGapKcal) ≥ 0.6 —
  trim drives post-court upkeep gaps (engine shortfalls + policy gate-skip
  weeks, kcal-denominated). (S2) CLASS-SHIFT: among dissolved runs, the
  share whose primary cause class is upkeep-driven (trust-below-bar with
  upkeep notes in the window, or arrears-bar) is higher armed than
  control. Verdict classes: DIAG-GO (PRIMARY met AND S1+S2 support the
  trim→upkeep mechanism — confirmed tradeoff for the default-ON call),
  DIAG-NO (PRIMARY met, S1/S2 reject the trim channel — dissolutions are
  chaos-driven, no trim dose), open (PRIMARY missed).
- **Named cause classes (pre-registered, from engine mechanics)**:
  trust-below-bar, arrears-bar, link-broken (revolt / succession-neglect /
  walked / released / seceded), primary-realm-shrank, mercy-expired;
  proximate mechanism notes mapped from link.history kinds:
  upkeep {arrears, tribute, tended, pool, tariff}, leader-death
  {succession}, conquest-strain {revolt, sabotage}, crisis/demand {crisis,
  demand, call}, renegotiation {renegotiation}, break {broken}.
- **Seeds/method/horizon**: 8 seeds (8801–8808) × {leadfeast, belongfeast} ×
  {control (SURPLUSFEED unset), armed (SURPLUSFEED=1)} = 32 runs, 180d
  death-aware (the post-court window runs ~d77–175 on the parent substrate;
  180d captures the full window plus tails), FEASTSCALE_R13=1 +
  SEATDRIVE=0 explicit. PAIRED REUSE of the 8801-8808 set (same documented
  exception as the parent — not a fresh-seed claim). Both arms re-measured
  on the CURRENT tip in one sweep (substrate shift discipline per the
  parent: the parent's corpus is not a control across master movement).
- **Instrument proof (pre-registered, all must pass before the sweep)**:
  (a) RED: pristine runs carry no link-instrument state;
  (b) GREEN: dissolution event captured with named dropout links + failing
  bars on a dissolving seed; instrument bar-diagnosis agrees with the
  engine's own `_havenPolity()` null/non-null on 100% of dawn samples
  (two-source check); upkeep channels record engine return values;
  (c) ENGAGE: post-court upkeep gaps (shortfalls or gate-skips) recorded
  on a lean-pantry seed;
  (d) DET: instrumented vs pristine byte-identical canonical projection —
  ALL new wraps RNG-clean (_checkNational, sleep census additions,
  payTribute, tendLink, covenantTick, tradeTick, answerRenegotiation,
  _removePantryKcal marker);
  (e) REPEAT: same armed seed twice in-process byte-identical;
  (f) RED-EQUIVALENT same-commit: this driver (SURPLUSFEED unset) ≡
  parent's probe-surplusfeed-national-b.js (unset) on the same commit —
  the parent row fields byte-identical (zero drift added to the paired
  substrate).
- **Honesty bars (binding)**: polity-agreement 100% (instrument diagnosis
  vs engine `_havenPolity()` every dawn); upkeep paid = engine return
  values (exact by construction); dissolution court-day cross-checked
  against the standing trajectory's national marker.
- **Balanced panel (§15)**: inexpressible — same class as the parent
  (documented there): the treatment (SURPLUSFEED=1 env var) is not part of
  panel case identity, the substrate is not the §15 contract substrate, and
  the pre-registered primary (dissolution attribution) is not a contract
  metric. No bogus compare shipped; the before/after is the paired
  analysis on identical seeds, commit, and instruments.

## Metric review (§14 — mandatory section)

- PRIMARY ≥80% / 0-unexplained: judged as written; a miss is NO-GO, never
  re-scored. If the bar misses because dissolution events are dominated by
  death-forks (no live polity to diagnose), that is a substrate finding
  reported under "open", not a re-scored bar.
- S1's ≥0.6 mirrors the parent's rejected bar shape deliberately — the
  question moved from feast-spend to upkeep-gaps; the sign and magnitude
  both matter (a wrong-signed S1 rejects the trim→upkeep channel the same
  way the parent's −0.529 rejected the tax hypothesis).
- S2's class-shift is directional, not thresholded — reported with counts,
  not judged pass/fail alone.
- If the census shows the polity failing on a road the court didn't sit
  (e.g. court sat lead, but a covenant near-miss is the binding story),
  that goes here as a metric-design note for the next arm — the bars are
  judged on the court road as pre-registered.

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. Diagnostic: zero game
  code touched. The feast is the village's social engine; the court
  ceremony is kcal-priced and honor is proportional to paid (parent canon
  note kept). New for this arm: the realm is a LIVE RELATIONSHIP, not a
  title (hierarchy.js:2102-2113 — "a polity is a live relationship, not a
  title... when the realm dies the rank dies with it — aloud"); tending is
  required (canon: links form at trust 30, the seasoned bar is 40 — the
  10-point gap is the tending the lead road's tendLink verb exists to
  fill); "their fields pay" — subordinate tribute debits THEIR pantry, so
  trim cannot starve subordinates directly, only Haven's own upkeep.

## Proof results (pre-sweep — 20/20 GREEN, 2026-10-20/21)

scripts/test-linkdissolve-b.js: **20/20 GREEN** (run with FEASTSCALE_R13=1
SEATDRIVE=0 per the Usage header — ENV TRAP honored).

- RED: pristine runs carry no link-instrument state, armed and unset (2/2).
- GREEN (8801 armed leadfeast × 180d — court d77, dissolution d158, village
  survives 180d, the honest non-degenerate case on this commit): dissolution
  event captured with road=court road (lead), courtDay=77, link snapshot;
  court staged d77 lead; polity agreement 100% (instrument bar-replication
  vs the engine's own `_havenPolity()` on every dawn sample — the two-source
  honesty check); dissolution attributed trust-below-bar with upkeep notes
  in the window; upkeep channels record engine return values (tend paid>0);
  the realm-death say-line captured (11/11).
- ENGAGE: post-court upkeep gap kcal > 0 and shortfall signals (tend<1500
  or policy gate-skip weeks) on the lean-pantry seed (2/2).
- DET (8817/8818 × 40d, instrumented vs pristine): canonical game-state
  projections byte-identical — ALL new wraps RNG-clean (_checkNational,
  sleep census, payTribute, tendLink, covenantTick, tradeTick,
  answerRenegotiation, _removePantryKcal marker, say capture) (2/2).
- REPEAT: same armed seed twice in-process byte-identical (1/1).
- RED-EQUIVALENT same-commit (8801/8802 × 60d belongfeast, SURPLUSFEED
  unset): this driver ≡ parent's probe-surplusfeed-national-b.js
  byte-identically on all parent row fields — the link instrument adds zero
  drift to the paired substrate (2/2).

One instrument bug caught by the proof before the sweep (documented per
proof-first discipline): the analyzer's first attribution pass required
EVERY court-polity link to fail a bar, but LEAD/COVENANT/TRADE polities are
COUNTS of seasoned links — still-seasoned links are not failures, there
are just too few left. Fixed in the analyzer (only sub-bar links are
dropouts; belong keeps its single-link logic). The instrument data was
correct throughout; the fix is analysis-side.

## Sweep results (32 runs, substrate 0301f2450 — paired control+armed, same commit)

Wall numbers (paired, armed / control, n=16):
won 0/16 / 0/16, national (end-state) 3/16 / 7/16, national (ever-hit) 12/16 / 13/16,
table 13/16 / 12/16, wave-4 13/16 / 16/16, wave-5 0/16 / 0/16,
median 144d / 143d, max 180d / 180d.

The parent's headline replicates on this tip: armed runs reach the court
just as often (12/13 ever-national) but lose the realm more often — 9/16
armed runs dissolved post-court vs 6/16 control (+3 pairs net: 5 armed-only
vs 2 control-only, 4 both).

### PRIMARY — attribution: 16/17 events named (94%), 1 unexplained → NO-GO as written

17 post-court realm-dissolution events; 16 attributed to named cause
classes, 1 unexplained. Bar requires ≥80% AND 0 unexplained — the bar
MISSES as written (see metric review for the 1 case).

Cause-class census (class/arm): trust-below-bar 7 armed / 3 control,
arrears-bar 2 armed / 4 control. No link-broken, no primary-realm-shrank,
no mercy-expired in this corpus. Polity agreement held 100% across 4,493
dawn samples — the bar replication never diverged from the engine.

The named mechanics, per event (scripts/analyze-linkdissolve-b.js):
- LEAD road (9 events): the dropout is always trust-below-bar on a
  HOME-primary link (e.g. 80→36, 92→37, 100→28). The post-court note
  windows are succession-heavy: leader-death haircuts (−8 × deaths)
  compounded by tribute thin/nothing weeks (−1/−2) while tending (+8/wk)
  had halted. Two events had two simultaneous dropouts (8804, 8806 armed).
- BELONG road (8 events): the dropout is arrears-bar (trust often ROSE:
  81→87, 54→94 — but arrears>0 breaks the good-standing bar) or
  trust-below-bar (50→48, 51→42). Notes show tribute shorts, demands, and
  succession. The belong road is a razor's edge: ONE missed tribute week
  post-court (arrears 11,250) dissolves the realm — 8801 belongfeast armed
  sat its court d72 and dissolved d77.

### SECONDARY — the trim→upkeep verdict for the default-ON call

- S1 DOSE: Pearson(trimKcal, upkeepGap_armed−control) = **−0.047** (bar ≥
  0.6) — MISS, decisively flat. There is NO linear trim-dose relationship
  on post-court upkeep gaps.
- S2 CLASS-SHIFT: upkeep-driven primary cause on 9/9 armed dissolved runs
  vs 6/6 control — vacuous as a binary (tribute/tended notes are
  ubiquitous post-court); the informative cut is the gate-skip pattern
  below.
- The mechanism is THRESHOLD-MEDIATED, not dose-linear — and it is
  confirmed on the cleanest pair. 8801 leadfeast (both arms survived 180d;
  only armed dissolved): control pantry held 36–49k post-court (above the
  policy's 20k tending gate), tending continued weekly to d175+, realm
  held. Armed pantry collapsed 46k→2.8k after d105 (trim 318k, the only
  treatment difference); tending HALTED at the 20k gate from week 16;
  village_2 trust decayed 100→36 under succession haircuts; dissolved d158
  at trust<40. The same gate-skip→dissolution shape appears in every
  armed-only dissolution pair (8805/8806/8807 lead, 8801 belong) and in
  reverse on the control-only pairs (8808 lead, 8807 belong — the CONTROL
  pantry went sub-gate there).
- Treatment-level (not dose-level) shift: post-court mean pantry ran lower
  armed on 13/16 pairs; sustained sub-gate episodes are more
  frequent/longer on armed runs. The 20k (lead) / 2×-owed (belong) upkeep
  gates are POLICY choices (leadcourt.js, belongseek.js), not engine
  mechanics — the trim pushes pantries under gates the policy set.

Verdict for the default-ON call: the trim→upkeep→dissolution PATH is
confirmed as a mechanism (threshold-gated through the policy's own pantry
gates), but the population effect is modest (+3 pairs net) and there is no
linear dose to tune — the lever that matters is the policy gate level,
not the trim rate. DIAG-NO on the linear-dose reading; mechanism-confirmed
on the threshold reading (see metric review — the pre-registered classes
didn't have a "threshold-confirmed" box, so this stays open pending the
revised metric).

### Per-pair ledger (control / armed)

seed policy courts(c/a) diss(c/a) trimK gapK(c/a) primary cause (armed)
8801 lead 77/77 0/1 318k 0k/41k trust-below-bar+upkeep (village_2 80→36)
8802 lead 77/0 0/0 101k 14k/77k —
8803 lead 0/92 0/0 265k 51k/24k —
8804 lead 77/93 1/1 159k 42k/30k trust-below-bar+upkeep (village_3 40→33)
8805 lead 77/77 0/1 293k 5k/27k trust-below-bar+upkeep (village_spl 58→39)
8806 lead 77/77 0/1 269k 14k/54k trust-below-bar+upkeep (village_2 92→37)
8807 lead 79/77 0/1 27k 79k/23k trust-below-bar+upkeep (village_1 52→38)
8808 lead 77/77 1/0 417k 36k/32k — (control dissolved; highest trim, no armed dissolution)
8801 belo 72/72 0/1 144k 9k/113k arrears-bar+upkeep (village_3, trust 81→87, arrears 0→11250)
8802 belo 90/84 1/1 128k 67k/20k arrears-bar+upkeep (village_2 56→63)
8803 belo 72/97 1/2 117k 79k/113k trust-below-bar+upkeep (village_2 50→48)
8804 belo 82/72 0/0 40k 7k/5k —
8805 belo 0/0 0/0 176k 11k/29k —
8806 belo 72/78 1/1 172k 45k/68k UNATTRIBUTED (no-dropouts — see metric review)
8807 belo 165/0 2/0 32k 26k/81k — (control dissolved ×2 incl. a re-formation)
8808 belo 0/0 0/0 98k 6k/90k —

Notes: 8807 belongfeast control dissolved d161, RE-FORMED (court d165),
dissolved again d175 — the realm is a live state in both directions.
8803 belongfeast armed dissolved twice (d84, d105) across two courts.
Several dissolutions are death-adjacent (village-lost within days:
8804/8805/8806/8807 lead armed) — the succession haircuts that kill trust
are the same deaths that kill villages.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

The realm-death copy reads as played, not ledger-flipped: "◈ The realm came
apart — no polity answers to Haven now, and Haven is a free fire again.
National and global no longer describe this village. The climb starts
over." — the direct callback to the court's "Try not to lose it the way
you found it." The upkeep beats read honest and specific: "🌾 Nothing comes
from Thornfield this week — their fields are as empty as the wagons look.
Hunger isn't defiance, but the ledger doesn't know the difference. (Arrears
+1,688 kcal, trust -2.)" Aid between fires reads as people: "🏃 Yuki of
Stonebridge walks into Haven unannounced, pack-mules behind. 'Heard your
bins are echoing. Stonebridge has grain to spare — 2,595 kcal, no tribute,
no ceremony. Say the word.'" The dissolution on 8801 is legible as a story:
Haven kept sending grain (tended notes to d105), Thornfield's fields failed
week after week, speakers died, tribute was pressed down in the chaos, and
the bond went quiet below the bar. Nothing robotic; the trim's role is
mechanism-confirmed (threshold-gated), not dose-proven.

Out-of-arm observation filed to sim-findings.md (not chased): the policy
scholar with the Light Fingers thief ability trips the -5000 takes/gives
bar through ordinary pantry eating and eats ~30 "Caught red-handed! They
saw you steal. Trust -20." in 10 days post-court (8801 armed leadfeast
d135–144) — village-trust craters with no cooldown.

## Metric review (§14)

- PRIMARY ≥80% / 0-unexplained judged AS WRITTEN: 16/17 (94%) with 1
  unexplained → NO-GO, not re-scored. The 1 unexplained (8806
  belongfeast/armed d78) is a same-day court+dissolution granularity edge,
  manually investigated: the court sat intra-day d78 (nationalDay=78, oath
  sworn), then a succession haircut (−8, "They installed their own
  speaker. Tribute up to 11,250") dropped the belong link to trust 38<50
  and the realm dissolved the same day. The dawn census (trust 46) predates
  the staging — the instrument can't resolve intra-day ordering. Mechanism:
  trust-below-bar, a named class; NO new mechanism class. Proposed
  revision for the next arm: snapshot the engine's polity at staging time
  (wrap stageNationalBeat/answerNationalChoice) instead of reconstructing
  it from the dawn census.
- S1's ≥0.6 assumed a LINEAR dose-response; the measured −0.047 rejects
  the linear form but the mechanism is a STEP FUNCTION at the policy's
  pantry gates (20k lead / 2×-owed belong). The honest revision: judge the
  trim→upkeep channel on threshold metrics (sub-gate weeks armed vs
  control; dissolution following sustained sub-gate halts), not Pearson.
  S1 as written is a MISS — not re-scored here.
- S2's binary "upkeep-driven" rule (trust-below-bar + any upkeep note) is
  vacuous — tribute/tended notes are ubiquitous post-court on both arms
  (9/9 vs 6/6). The informative cut is the gate-skip census (weeks with
  zero upkeep calls + sub-gate pantry), which the analyzer already
  reports per pair.
- The pre-registered verdict classes had no "threshold-confirmed" box:
  DIAG-GO required S1+S2 on the linear reading. The mechanism is confirmed
  on the threshold reading; the run stays open pending the revised metric.
  The default-ON call input stands as written above regardless: the path
  is real, modest (+3 pairs), policy-gate-mediated, and not dose-tunable.

## Balanced panel (§15) — inexpressible, no bogus compare shipped

Same class as the parent (documented there and in the pre-registration):
the treatment (SURPLUSFEED=1 env var) is not part of panel case identity,
the substrate is not the §15 contract substrate, and the pre-registered
primary (dissolution attribution) is not a contract metric. No compare
shipped; the before/after is the paired analysis on identical seeds,
commit, and instruments (scripts/analyze-linkdissolve-b.js).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-20/perseed-linkdissolve-b/*.json' --metrics
national,table,wins,exiled` fired LOUD on national/table/wins — the
documented spurious class: the baseline's own `_regime` block says "DO NOT
compare pre-seat / courtship / readiness substrates against this baseline —
wins are structurally ~0 there". This corpus is the courtship substrate
(FEASTSCALE_R13=1, SEATDRIVE=0, no win stack); the regime-correct comparison
is armed vs the same-commit control (national end-state 3/16 vs 7/16;
ever-national 12/16 vs 13/16; dissolved runs 9/16 vs 6/16). Baseline NOT
rolled.

## Convergence state

**open — mechanism named and threshold-confirmed, bars as-written missed.**
The named next is answered: post-court realm dissolutions are
trust-below-bar (lead: succession-haircut-driven trust decay under halted
tending) and arrears-bar (belong: one missed tribute week breaks
good-standing) — 16/17 attributed by the instrument, the 17th manually
named (same-day granularity edge, no new mechanism class). The trim drives
dissolution through the upkeep channel ONLY as a threshold effect via the
policy's own pantry gates (20k / 2×-owed): confirmed on the clean 8801
pair and present in every armed-only dissolution, but with no linear dose
(S1 = −0.047) and a modest population effect (+3 pairs net). The actionable
lever is the policy gate level, not the trim rate — and it is policy-side,
not an engine defect. **DO NOT TOUCH src/js; no lever to land — this was
instrument-only on a landed governor.** food-economy stays converging; the
wall is unmoved (wins 0/32, wave-5 0/32).
