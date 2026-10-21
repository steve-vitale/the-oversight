# sim-surpluskeep-diag-b — does the SURPLUSFEED trim starve realm UPKEEP (tribute/tend flows) after the court sits?

Run: fleshout-loop-b-20261021T0730Z, arm sim-surpluskeep-diag-b
(DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js changes,
zero new policy layers). Worker tree: ~/workspace/worktrees/sim-surplusnat-b.
The exact named next of the landed-open sim-surplusfeed-national-b
(c7697540c): armed runs reach the court as often (12/13 ever-national on
the parent substrate) but LOSE THE REALM more often (9/12 vs 6/13).
The standing-accumulation-tax hypothesis was REJECTED (wrong-signed dose
correlation, no systematic standing slowdown). What IS real is post-court
UPKEEP. This arm names the mechanism.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Question**: armed runs (SURPLUSFEED=1) reach the court as often but lose
  the realm more often. Does the trim lean the pantry onto the POLICY'S OWN
  upkeep gates — belongseek's `pantryKcal > 2× tribute` tribute gate and
  leadcourt's `pantryKcal > 20000` tendLink gate — so upkeep payments get
  skipped, arrears accrue, trust craters, and the polity dissolves?
- **Engine mechanism chain under test** (all engine/policy code, read-only):
  trim at villagerMealDay's share path → leaner pantry → belongseek SKIPS
  weekly tribute when `pantryKcal ≤ 2× tributeKcalPerWeek` (belongseek.js)
  / leadcourt SKIPS weekly tendLink when `pantryKcal ≤ 20000`
  (leadcourt.js) → linkTick charges the true shortfall (belong: arrears,
  trust −6/wk; lead: their-field tribute shortfalls, trust −1/−2/wk) →
  LEAD: subordinates fall below the `_linkSeasoned` polity bar
  (30+ days, trust ≥ 40 — polityOf requires ≥3 seasoned, no break needed);
  BELONG: Haven's sub-link leaves "good standing" (trust ≥ 50, arrears ≡ 0,
  link ≥ 14d — arrears > 0 ALONE disqualifies, no break needed) →
  `_checkNational` clears nationalLive aloud. The neglect snap
  (breakLink 'succession': leader death + trust < 20 + 14d no upkeep) and
  the conquest revolt lottery (breakLink 'revolt': trust < 30, 5%/wk) are
  the break-side killers; trust-crater and arrears-disqualify are the
  no-break killers.
- **Dissolution-cause taxonomy** (pre-registered; classified per run from
  instrument records, not from vibes):
  1. `arrears-disqualify` (belong): realm lost while Haven's sub-link
     carried arrears > 0 (or trust < 50) — the good-standing bar, no break.
  2. `trust-crater-below-seasoned` (lead): realm lost with ≥1 polity sub
     fallen below the trust-40 seasoned bar, no break.
  3. `break-succession-neglect`: breakLink 'succession' (leader death +
     trust < 20 + 14d no upkeep) on a polity link within the collapse
     window.
  4. `break-revolt`: breakLink 'revolt' (conquest link, trust < 30).
  5. `break-policy`: breakLink 'seceded'/'released'/'walked'/'gambit' —
     covenant/trade crisis answers or Haven's own break (policy-driven,
     trim-orthogonal unless trust-crater precedes them).
  6. `primary-realm-collapse` (belong): Haven's own link stayed good; the
     PRIMARY's foreign polity collapsed (foreignPolities — not our upkeep).
  7. `fork-artifact`: the run died (village-lost) before/inside the gap
     window — a death-fork pair, not mechanism (8807-class).
- **DIAG-GO bar** (concrete; mechanism confirmed iff ALL hold):
  1. UPKEEP-DOSE: Pearson(trimKcal, upkeepPaidDelta(control−armed per
     paired seed)) ≥ 0.5 — the trimmed kcal taxes the RECURRING upkeep
     spend (payTribute + tendLink pantry outflow, real kcal; court-ceremony
     spend EXCLUDED — outcome-scale payment, not the recurring mechanism).
  2. SKIP-SHIFT: armed skipped-upkeep-weeks per polity link-week >
     control on ≥ 75% of paired seeds (≥ 12/16) — the pantry gate visibly
     gates upkeep, not just spend totals.
  3. DISSOLUTION-ATTRIBUTION: ≥ 75% of honest-gap pairs attribute to an
     upkeep-mechanism cause (taxonomy 1–4). Honest-gap pairs =
     armed ever-national ∧ armed end-state ¬national ∧ armed survived ≥
     control's nationalDay (excludes the 8807-class fork-artifact).
     n < 4 honest-gap pairs → the bar is INCONCLUSIVE (reported open),
     not silently passed.
  4. CHAIN-SIGNATURE: on ≥ 50% of upkeep-attributed armed breaks/losses,
     the 28-day pre-loss window carries the full chain: ≥2 skipped upkeep
     weeks (or arrears accruing) AND trust declining to < 40 (lead) or
     < 50 / arrears > 0 (belong).
- **Verdict classes**: DIAG-GO (mechanism confirmed; named next is the
  SURPLUSFEED default-ON call — a coordinator/Steve decision, NOT this
  arm's) or open (mechanism unproven — say what remains).
- **Seeds/method/horizon**: 8 seeds (8801–8808) × {leadfeast, belongfeast}
  × {control (SURPLUSFEED unset), armed (SURPLUSFEED=1)} = 32 runs, 180d
  death-aware, FEASTSCALE_R13=1 + SEATDRIVE=0 explicit. PAIRED REUSE of the
  8801–8808 set (documented, not a fresh-seed claim). Control re-measured
  on the CURRENT base in the SAME sweep — the parent ran on 65b460256;
  this sweep runs on 9c634ebac for BOTH arms (the #746 method finding:
  historical corpora are not controls). Env from the Usage header — the
  RECOVERY ENV-TRAP (AGENTS.md 2026-10-20): read the header before every
  proof/sweep run.
- **Instrument proof** (pre-registered, all must pass before the sweep):
  (a) RED: pristine runs carry no upkeep-instrument state (armed + unset);
  (b) GREEN: dawn per-link snapshots sampled (trust/arrears/
  tributePaidWeek/tendedWeek/lastKeptDay/status ints), breakLink wraps
  record {day, how, trust, arrears, days-since-kept, nationalLive} with a
  constructed-case honesty check, payTribute/tendLink wraps record
  {day, paid, pantryBefore}, national-lost events captured on the
  nationalLive true→false dawn edge, dissolution say-lines captured by
  fixed regex; (c) ENGAGE: trim telemetry fires on glut days;
  (d) DET-armed: instrumented vs pristine byte-identical canonical
  projection EXTENDED with hierarchy links (ALL new wraps — breakLink,
  payTribute, tendLink, sleep×3rd, surplusFeedGovernor — RNG-clean);
  (e) REPEAT: same armed seed twice in-process byte-identical;
  (f) RED-EQUIV: instrumented vs pristine outcome fields on identical
  seeds — the new wraps add zero drift to the paired substrate.
- **Honesty bar (binding)**: upkeep attribution exact by construction
  (engine return values: payTribute/tendLink paid); link ids excluded from
  canonical projections and cross-run joins (link.id embeds
  Date.now()+R() — run-local only; other-village id is the cross-run key).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. Diagnostic: zero game
  code touched, zero policy layers built. The feast is the village's social
  engine; tribute/tendLink are the REALM's upkeep engine — real pantry
  kcal for trust, priced honestly (partial pantries aid partially; thin
  tribute accrues arrears, said aloud). "Rot can't be smoked back into
  food" untouched. Purify/skill lanes untouched (no disease content).

## Proof results (pre-sweep — all green, 2026-10-21)

scripts/test-surpluskeep-b.js: **30/30 GREEN** (run with
FEASTSCALE_R13=1 SEATDRIVE=0 per the Usage header — ENV TRAP honored).

- RED: pristine runs carry no upkeep-instrument state, armed and unset
  (2/2).
- GREEN (8821/leadfeast + 8822/belongfeast × 100d armed): dawn per-link
  snapshots sampled with int fields trust/arrears/tpw/tdw/lkd/status/dir
  (10/10); payTribute/tendLink wraps record day/other/paid/pantryBefore
  (4/4 — leadfeast exercises tendLink, belongfeast exercises payTribute);
  upkeep honesty: pantryBefore >= paid on every event, both paths (2/2);
  breakLink wrap honest on a constructed case (5/5: engine's post-break
  trust/arrears/keptDays read back exactly); national sat/lost edges +
  per-link snapshots honest on constructed dawnUpkeepSensor cases (4/4);
  dissolution say-lines captured by the fixed regex, positive + negative
  (2/2).
- ENGAGE: trim telemetry fires on glut days — 8821/8822 armed, trimKcal > 0
  (2/2).
- DET-armed (8823/8824 × 40d, instrumented vs pristine): canonical
  projections byte-identical INCLUDING the hierarchy-link extension — ALL
  new wraps (breakLink, payTribute, tendLink, sleep, surplusFeedGovernor)
  are RNG-clean (2/2).
- REPEAT: same armed seed twice in-process byte-identical (1/1).
- RED-EQUIV same-commit (8801/8802 × 60d, SURPLUSFEED unset):
  instrumented ≡ pristine outcome fields — the upkeep instrument adds zero
  drift to the paired substrate (2/2).

One design addition during proof (not a bug): the `dir` field (Haven
subordinate=0 / primary=1 / peer=2) was added to dawn snapshots after the
proof process had loaded the module — a pure read of existing engine
fields, zero mutation surface; DET/REPEAT/RED-EQUIV in the running proof
were self-consistent on the pre-dir module. No instrument bugs found;
the honesty bars (pantryBefore >= paid, constructed break/edge cases)
all passed first try.

## Sweep results (32 runs, substrate 9c634ebac — paired control+armed, same commit)

Wall numbers (paired, armed / control, n=16):
won 0/16 / 0/16, national (end-state) 5/16 / 7/16, national (ever-hit) 11/16 / 11/16,
table 13/16 / 12/16, wave-4 13/16 / 13/16, wave-5 0/16 / 0/16,
median 148.5d / 154d, max 180d / 180d, exiled 0/16 / 0/16.

The wall stands (zero wins, wave-5 0/16, pre-seat) — this diagnostic does not
attack the wall.

### The substrate moved under the question

The parent's motivating gap (armed 9/12 vs control 6/13 realm losses on
65b460256) does NOT reproduce in the same shape on 9c634ebac. On the LEAD
road, control holds 7/8 end-state and armed holds 5/8 (four of the armed
"holds" are dead villages — the realm outlived the village; no 'lost' edge
fired). On the BELONG road, NEITHER arm holds the realm (0/8 both) — the
losses classify as `primary-realm-collapse` on 7/9 classified belong losses
across BOTH arms: Haven's own sub-link sits in good standing (trust 68–94,
arrears 0) while the PRIMARY's foreign polity falls apart. That is
trim-orthogonal and substrate-wide — a belong-road foreign-polity finding,
not an upkeep finding (filed to the backlog, not chased). The 8808
arrears-disqualify fires IDENTICALLY on both arms (arrears 11,250 both) —
deterministic, trim-orthogonal.

### Bar 1 — UPKEEP-DOSE: MISS (wrong-signed, twice)

Pearson(trimKcal, upkeepPaidDelta(control−armed)) = **−0.521** (bar ≥ 0.5).
The SAME wrong sign as the parent's feast finding (−0.529). The
dose-proportional hypothesis — more trim → proportionally less upkeep
spend — is rejected on the sign, not just the magnitude. High-trim seeds
are glut-prone seeds; upkeep spend follows the policy cadence and realm
size, not the trim. (8803 lead: trim 500k, upkeep 83k armed vs 60k
control; 8801 bel: trim 514k, upkeep 115k armed vs 64k control.)

### Bar 2 — SKIP-SHIFT: MISS (10/16, bar 12/16)

Armed skip-rate > control on 10/16 pairs — a lean in the hypothesized
direction, but below the 75% bar. Not systematic: lead road 4/8 armed /
2/8 control / 2 ties; belong road 4/8 armed / 2/8 control. The skips are
threshold-gated (the policy's absolute gates: pantryKcal > 20,000 for
tendLink, > 2× tribute for payTribute), not dose-driven — which is why
bar 1 fails on the sign while bar 2 leans.

### Bar 3 — DISSOLUTION-ATTRIBUTION: INCONCLUSIVE (n=1 honest-gap pair)

Only ONE pair meets the honest-gap definition (armed ever-national ∧
armed end ¬national ∧ control end national ∧ armed survived to control's
court day): **8802 leadfeast**. It attributes to
`trust-crater-below-seasoned` — and carries the FULL 28-day chain
(bar 4: 1/1 GO, vacuous-adjacent). Per the pre-registered rule (n < 4 →
INCONCLUSIVE), the attribution bar does not pass or fail — it is reported
open. The 8802 case is documented below as a complete mechanism exemplar,
not a bar pass.

### The 8802 leadfeast exemplar — the full chain, caught red-handed

Armed 8802 (trim 203k over 110 trim-days): court sat d78; tending ran
weekly through d78 (pantryBefore declining 32.5k → 21.4k); then the pantry
fell through the policy's 20,000 gate and tending STOPPED — 9 skipped
tend-weeks in the 28 days before the loss. village_1's trust cratered
100 → 7 (weeks 12–21); at d124/125 the realm dissolved with only 2/3
subordinates above the `_linkSeasoned` trust-40 bar — NO link broke. The
village then starved (pantryEnd 0, dead d149). Control 8802 (same seed,
no trim): pantry held 30–55k, tending continued, realm held to the
village's death at d116. Paired seeds, same substrate — the trim is the
difference, and the difference is the pantry crossing the absolute gate.
This is the threshold-gated upkeep-starvation mechanism the hypothesis
named — real, complete, and n=1.

### Bar 4 — CHAIN-SIGNATURE: 1/1 GO (n=1, vacuous-adjacent)

The single upkeep-attributed armed loss (8802) carries the full chain:
≥2 skipped upkeep weeks (9) AND trust declining below the polity bar
(100→7, bar 40). Reported as GO per the letter of the bar, with the
n=1 caveat stated plainly.

### Verdict: open (mechanism unproven as pre-registered)

- The DOSE-PROPORTIONAL trim→upkeep-tax mechanism is REJECTED (bar 1,
  wrong-signed −0.521, second independent rejection after the parent's
  −0.529).
- The THRESHOLD-GATED mechanism (trim clips the pantry below the policy's
  absolute upkeep gates → skipped upkeep → trust erosion → no-break
  dissolution) is PLAUSIBLE and fully exemplified on 8802, but NOT
  confirmed at the pre-registered bars (bar 2 miss at 10/16; bar 3
  inconclusive at n=1).
- The belong-road realm collapse on this substrate is trim-orthogonal
  (primary-realm-collapse, both arms) — it is not the trim's doing.
- Until a systematic confirmation runs, the default-ON call has a
  documented open tradeoff signal with one complete causal exemplar, not
  a confirmed systematic mechanism.

### Instrument honesty across the sweep

Upkeep attribution exact by construction (engine return values:
payTribute/tendLink paid; pantryBefore ≥ paid on every event, both
paths — the proof's honesty bar). Break attribution reads the engine's
post-break state (proof-constructed). Feast honesty ≥99% kept from the
parent instrument (all 32 runs). Governor engagement: trim fired on
16/16 armed runs (15k–514k per run), 0 on controls.

## Per-pair ledger (control / armed)

seed policy days natEnd natDay trimK upkeep(c/a) skipRate(c/a) breaks cause(armed)
8801 leadfeast 180/150 1/1 77/77 234k 102k/49k 0.00/0.46 0/0 — (armed died d150, realm intact)
8802 leadfeast 116/149 1/0 77/77 203k 51k/28k 0.20/0.68 0/0 trust-crater-below-seasoned (FULL chain)
8803 leadfeast 151/180 1/1 77/77 500k 60k/83k 0.32/0.22 0/0 —
8804 leadfeast 61/34 0/0 0/0 16k 0k/0k 1.00/1.00 0/0 — (both died pre-court)
8805 leadfeast 89/74 1/0 87/0 116k 30k/27k 0.30/0.26 0/0 — (armed never sat)
8806 leadfeast 154/116 1/1 77/77 138k 65k/39k 0.31/0.43 0/0 — (armed died d116, realm intact)
8807 leadfeast 180/119 1/1 134/80 213k 22k/51k 0.75/0.24 1/0 — (armed died d119, realm intact)
8808 leadfeast 154/153 1/1 77/77 233k 66k/58k 0.32/0.40 0/0 — (armed died d153, realm intact)
8801 belongfeast 112/180 0/0 0/72 514k 64k/115k 0.57/0.49 2/1 primary-realm-collapse
8802 belongfeast 158/179 0/0 79/109 191k 80k/56k 0.61/0.74 1/2 primary-realm-collapse
8803 belongfeast 180/135 0/0 72/101 120k 94k/80k 0.59/0.60 2/1 primary-realm-collapse
8804 belongfeast 98/80 0/0 0/0 15k 88k/52k 0.00/0.36 0/1 — (both died pre-court)
8805 belongfeast 128/180 0/0 0/0 244k 100k/110k 0.31/0.48 1/1 — (neither sat)
8806 belongfeast 180/148 0/0 73/120 110k 132k/82k 0.54/0.70 1/1 primary-realm-collapse
8807 belongfeast 180/70 0/0 0/0 32k 36k/42k 0.73/0.25 2/1 — (neither sat)
8808 belongfeast 180/172 0/0 72/72 119k 100k/114k 0.39/0.41 1/1 arrears-disqualify (identical arr 11,250 both arms — trim-orthogonal)

natEnd is end-state nationalLive; natDay persists as the ever-hit marker.
"Realm intact" = village died with nationalLive still true (no 'lost' edge).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read the full dissolution corpus for the exemplar (8802 armed leadfeast,
21 captured lines). The fiction reads as PLAYED upkeep while it lasts,
then goes QUIET on the cause:

- d26–d78: Haven faithfully tends all three subordinates weekly —
  "🌾 Haven sends 1,500 kcal of grain to Emberhold's fire — not tribute,
  the other way around. Someone's grandmother over there will remember
  who fed her. (Trust +8.)" Communal, honest, repeated without feeling
  robotic (the village names rotate: Emberhold, Stonebridge, Thornfield).
- d28: their own tribute comes up thin, voiced with the arrears math —
  "🌾 Emberhold's tribute comes up thin — 600 of 4,000 kcal. They sent
  everything the wagons could carry, and it wasn't enough. The shortfall
  rides as arrears (+3,400 kcal). (Trust -1.)" / "🌾 Nothing comes from
  Stonebridge this week — their fields are as empty as the wagons look.
  Hunger isn't defiance, but the ledger doesn't know the difference."
  Upkeep failure reads as upkeep failure here.
- After d78: SILENCE. The tending stops with no voiced reason — the
  policy's pantry gate (≤20,000) closes without a beat; tendLink's
  "The pantry is bare — there is no grain to send" refusal never fires
  because the policy never calls. village_1's trust falls 100 → 7 over
  nine weeks with NO voiced explanation — no "Stonebridge is drifting,"
  no cooling-bond beat. The numbers erode; the fiction doesn't notice.
- d124: "◈ The realm came apart — no polity answers to Haven now, and
  Haven is a free fire again. National and global no longer describe this
  village. The climb starts over." The dissolution itself is voiced,
  and it reads as loss, not noise.

Verdict: the dissolution is voiced and the upkeep is voiced while paid,
but the trust-crater path to dissolution is a narration blank — the
player watches generous tending, then silence, then "the realm came
apart," with no fiction connecting them. Filed to the backlog as an
[open] narration blank (trust-erosion beats for sub-seasoned links).
Nothing robotic; the trim's role is unproven-not-unvoiced, same as the
parent run.

## Metric review (§14)

- DIAG-GO bars 1 and 2 MISSED as written — NOT re-scored. Bar 1's ≥0.5
  assumed a positive dose-response; the measured −0.521 is a substantive
  second rejection of the dose-proportional hypothesis (parent: −0.529
  on feast spend), not a calibration miss. The honest revision for the
  NEXT arm: the mechanism is threshold-gated (absolute pantry gates),
  not dose-proportional — pre-register against gate-crossing weeks and
  post-gate trust trajectories, not trim kcal.
- Bar 2's 10/16 is a lean, not a pass. A future skip-shift bar should
  separate the verbs (tend-skips on lead, tribute-skips on belong) and
  pre-register the threshold-crossing as the treatment, with the trim as
  the instrument that moves the pantry toward the gate.
- Bar 3's n≥4 rule worked as designed: with one honest-gap pair the bar
  is INCONCLUSIVE, and the 8802 exemplar is reported as an exemplar, not
  a pass. The gap definition itself needs revisiting for substrates where
  villages die with the realm intact — "end-state national on a corpse"
  is not a hold.
- Bar 4 at n=1 is vacuous-adjacent; reported as GO per the letter with the
  caveat stated. Future chain-signature bars should require n≥3.
- The belong-road `primary-realm-collapse` finding was outside the
  pre-registered taxonomy's expectations (taxonomy item 6 existed, but as
  a residual — it turned out to be the DOMINANT belong cause on this
  substrate, both arms). It is filed, not chased.

## Balanced panel (§15) — inexpressible, no bogus compare shipped

Same class as the parent run (documented there): the treatment
(SURPLUSFEED=1, an env var) is not part of panel case identity
(`flagNames` excludes it), the substrate (leadfeast/belongfeast +
FEASTSCALE_R13=1, seeds 8801–8808, 180d) is not the §15 contract substrate,
and the contract metrics don't include the pre-registered primary
(trim→upkeep Pearson, dissolution-cause attribution). No compare shipped;
the before/after is the paired analysis above on identical seeds, commit,
and instruments (scripts/analyze-surpluskeep-b.js).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall-preseat.json
--current 'evidence/2026-10-21/perseed-surpluskeep-b/flat/*.json'
--metrics national,table,won,exiled` → **quiet** (32 files, 4 metrics, no
large deviations). Regime note: the baseline carries a richer stack
(TRIBFLOOR/SUCCGRACE/WINDEFER/VETREL/RAIDDENSITY/WINPURSUIT); this corpus
is the bare FEASTSCALE_R13=1/SEATDRIVE=0 substrate. national 21→12 (43%
down) does not trip the 60% LOUD threshold but is consistent with the
substrate's belong-road realm fragility documented above. Baseline NOT
rolled. The flat per-seed summaries live in
evidence/2026-10-21/perseed-surpluskeep-b/flat/ (32 files).

## Convergence state

**open — mechanism unproven as pre-registered.** The dose-proportional
trim→upkeep-tax hypothesis is rejected twice over (this arm −0.521,
parent −0.529); the threshold-gated upkeep-starvation mechanism is fully
exemplified on one seed (8802 leadfeast: trim → pantry below the 20k
tend gate → 9 skipped tend-weeks → trust 100→7 → no-break dissolution
at the trust-40 bar) but not confirmed systematically (skip-shift 10/16
miss; attribution n=1 inconclusive). The belong-road realm collapse on
9c634ebac is trim-orthogonal (primary-realm-collapse, both arms 0/8).
**DO NOT TOUCH src/js; no lever to land — instrument-only on a landed
governor.** food-economy stays converging; the wall is unmoved (wins
0/16, wave-5 0/16). Named next for the default-ON call: a
threshold-gated confirm (pre-register gate-crossing weeks, not trim
dose) — a coordinator/Steve decision, NOT this arm's.
